import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase';
import { initializeUserDetails } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(String(code));
    
    if (error) {
      throw error;
    }

    if (data?.user) {
  
      // console.log('User authenticated:', data.user);


      await initializeUserDetails(data.user.id);

      // Get role from user_details
      const { data: profileData } = await supabase
        .from('user_details')
        .select('role')
        .eq('id', data.user.id)
        .single();

        // console.log('Profile data:', profileData);
      if (profileData?.role && !data.user.user_metadata?.role) {
        await supabase.auth.updateUser({
          data: { role: profileData.role }
        });
      }
    }

    // Redirect to dashboard
    res.redirect(302, '/dashboard');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(302, '/login?error=VerificationFailed');
  }
}
