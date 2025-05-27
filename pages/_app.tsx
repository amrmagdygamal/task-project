import type { AppProps } from 'next/app';
import '../app/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase';

export default function MyApp({ Component, pageProps }: AppProps) {
  const { setSession, setRole } = useAuthStore();

  useEffect(() => {
    // console.log('Initializing auth')

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);

        const role = session.user.user_metadata?.role;

        // console.log('Initial session:', session)
        // console.log('Initial role from metadata:', role)
        if (!role) {
          const { data: profileData } = await supabase
            .from('user_details')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileData?.role) {
            setRole(profileData.role);
          }
        } else {
          setRole(role);
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        // Update role when session changes
        try {
          // Try metadata first
          const role = session.user.user_metadata?.role;
          if (role) {
            setRole(role);
          } else {
            const { data: profileData, error } = await supabase
              .from('user_details')
              .select('role')
              .eq('id', session.user.id)
              .maybeSingle(); // Use maybeSingle to avoid 406 error

            if (error) {
              console.error('Error fetching user role:', error);
              // Fallback to default role if needed
              setRole('user');
            } else if (profileData?.role) {
              setRole(profileData.role);
            } else {
              // If no profile exists, create one with default role
              const { error: insertError } = await supabase
                .from('user_details')
                .insert({
                  id: session.user.id,
                  role: 'user',
                  email: session.user.email,
                  full_name:
                    session.user.user_metadata?.full_name || session.user.email,
                });

              if (insertError) {
                console.error('Error creating user profile:', insertError);
              }
              setRole('user');
            }
          }
        } catch (error) {
          console.error('Error updating role:', error);
          setRole('user');
        }
      } else {
        // Clear role when session ends
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setRole]);

  return <Component {...pageProps} />;
}
