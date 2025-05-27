import type { AppProps } from 'next/app'
import '../app/globals.css'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../utils/supabase'

export default function MyApp({ Component, pageProps }: AppProps) {
  const { setSession, setRole } = useAuthStore()

  useEffect(() => {
    // Set initial session and role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session)
        
        const role = session.user.user_metadata?.role

        // console.log('Initial session:', session)
        // console.log('Initial role from metadata:', role)
        if (!role) {
          const { data: profileData } = await supabase
            .from('user_details')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (profileData?.role) {
            setRole(profileData.role)
          }
        } else {
          setRole(role)
        }
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        // Update role when session changes
        const role = session.user.user_metadata?.role
        if (!role) {
          const { data: profileData } = await supabase
            .from('user_details')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (profileData?.role) {
            setRole(profileData.role)
          }
        } else {
          setRole(role)
        }
      } else {
        // Clear role when session ends
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setRole])

  return <Component {...pageProps} />
}