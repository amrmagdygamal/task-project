import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface AuthState {
  session: Session | null;
  loading: boolean;
  role: string | null;
  setSession: (session: Session | null) => void;
  setRole: (role: string | null) => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, fullName: string, password: string, role: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: false,
  role: null,
  setSession: (session) => set({ session }),
  setRole: (role) => set({ role }),
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      // First validate input
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      // Attempt to sign in
      let authResponse;      try {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } catch (networkError: unknown) {
        console.error('Network error during sign in:', networkError);
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection.'
        };
      }

      const { data: authData, error: authError } = authResponse;
      
      if (authError) {
        // Handle auth errors with user-friendly messages
        let errorMessage = 'Invalid email or password';
        if (authError.message.includes('Failed to fetch')) {
          errorMessage = 'Connection error. Please try again.';
        } else if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in';
        }
        return { success: false, error: errorMessage };
      }
      
      if (!authData.user) {
        return { success: false, error: 'User not found' };
      }

      try {
        // Fetch additional user details from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('user_details')
          .select('*')
          .eq('id', authData.user.id)
          .single();
            if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Still allow login if profile fetch fails, try to get role from user_metadata
          const role = authData.user.user_metadata?.role;
          set({ 
            session: authData.session,
            role: role || null 
          });
        } else {
          // Try role from profile first, then user_metadata
          const role = profileData?.role || authData.user.user_metadata?.role;
          set({ 
            session: authData.session,
            role: role || null 
          });
        }
        
        return { success: true };
      } catch (profileError) {
        // Handle profile fetch error but still allow login
        console.error('Profile fetch error:', profileError);
        set({ 
          session: authData.session,
          role: authData.user.user_metadata?.role || null 
        });
        return { success: true };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      set({ loading: false });
    }
  },  signUp: async (email: string, fullName: string, password: string, role: string) => {
    set({ loading: true });
    try {
      // Validate input
      if (!email || !fullName || !password || !role) {
        return {
          success: false,
          error: 'All fields are required'
        };
      }

      try {
        // First validate the email format
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return { 
            success: false, 
            error: 'Invalid email format' 
          };
        }

        // Do the auth signup with email redirect
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) {
          console.error('Signup error:', error);
          return {
            success: false,
            error: error.message
          };
        }

        if (!data?.user) {
          return { 
            success: false, 
            error: 'No user data received' 
          };
        }

        // Create user_details record
        const { error: detailsError } = await supabase
          .from('user_details')
          .insert([{
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: role
          }]);

        if (detailsError) {
          console.error('Error creating user details:', detailsError);
          // Don't return error here as the user can still verify their email
        }
        
        return { 
          success: true,
          message: 'Please check your email for the verification link.'
        };

      } catch (error: unknown) {
        console.error('Network or signup error:', error);
        let errorMessage = 'Failed to create account';
        
        if (error instanceof Error) {
          if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered';
          } else if (error.message.includes('weak password')) {
            errorMessage = 'Password is too weak. Please use a stronger password';
          } else if (error.message.includes('invalid email')) {
            errorMessage = 'Please enter a valid email address';
          } else if (error.message.includes('User creation not confirmed')) {
            errorMessage = 'Account creation took too long. Please try again.';
          }
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error: unknown) {
      console.error('Unexpected error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      set({ session: null, role: null });
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new Error(`Failed to sign out: ${errorMessage}`);
    }
  },
}));





type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
};

interface SignupFormState {
  email: string;
  fullName: string;
  password: string;
  errors: FormErrors;
  setEmail: (email: string) => void;
  setFullName: (fullName: string) => void;
  setPassword: (password: string) => void;
  setErrors: (errors: FormErrors) => void;
  reset: () => void;
}

export const useSignupFormStore = create<SignupFormState>((set) => ({
  email: '',
  fullName: '',
  password: '',
  errors: {},
  setEmail: (email: string) => set({ email }),
  setFullName: (fullName: string) => set({ fullName }),
  setPassword: (password: string) => set({ password }),
  setErrors: (errors: FormErrors) => set({ errors }),
  reset: () => set({ email: '', fullName: '', password: '', errors: {} }),
}));
