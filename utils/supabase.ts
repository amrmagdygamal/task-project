import { createClient, Session } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: 'https://task-project-flax-kappa.vercel.app/dashboard'
  }
});

export type UserRole = 'admin' | 'user';

export interface UserDetails {
  id: string;
  role: UserRole;
  email: string;
  full_name: string;
  profile?: string;
  created_at: string;
  updated_at: string;
}

export interface VenuesDetails {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  capacity: number;
  description: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
  available: boolean;

  reservations: Array<{
    userId: string;
    startDate: string;
    endDate: string;
    
  created_at: string;
  }>;
  dayprice: number;
  created_at: string;
  updated_at: string;
}

// Helper function to initialize user_details after successful email verification
export const initializeUserDetails = async (userId: string): Promise<void> => {
  try {
    // Get the user's metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Failed to get user details');
    }

    // Check if user_details exists
    const { data: userDetails } = await supabase
      .from('user_details')
      .select('id')
      .eq('id', userId)
      .single();

    // If user_details doesn't exist, create it
    if (!userDetails) {
      await supabase
        .from('user_details')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          role: user.user_metadata.role
        }]);
    }
  } catch (error) {
    console.error('Error initializing user details:', error);
  }
};
