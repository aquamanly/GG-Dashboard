import { supabase } from '../supabase';

// In your '../services/userRoles' file

// Make sure to pass the supabase client into this file or initialize it here
// Example: import { createClient } from '@supabase/supabase-js'

export const fetchUserRoles = async () => {
  // 1. Get the current session (logged-in user)
  const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !sessionUser) {
    console.error("No active user session:", sessionError);
    // You might want to throw an error or return an empty array here
    throw new Error('User not authenticated.');
  }

  console.log(sessionUser.id)

  // 2. Fetch the team of the logged-in user (optional step, but often needed)
  // Assuming 'profiles' table stores the team data based on user id
  const { data: profileData, error: profileError } = await supabase
    .from('user_roles') // Replace 'profiles' with your actual user metadata table
    .select('*')
    .eq('user_id', sessionUser.id)
    .single();

  if (profileError || !profileData?.team) {
    console.error("Could not determine team for logged-in user:", profileError);
    throw new Error('Could not determine logged-in user team.');
  }
  console.log(profileData)
  const userTeam = profileData.team;
  console.log(`Filtering users by team: ${userTeam}`);

  // 3. Fetch all user roles, filtered by the logged-in user's team
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      // *** THIS LINE APPLIES THE FILTER ***
      .eq('team', userTeam) 
      
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data || [];
  } catch (err) {
    console.error('Error fetching user roles:', err);
    throw err;
  }
};

export const updateUserRole = async (u) => {
  const { id, ...updates } = u;
  const { data, error } = await supabase
    .from('user_roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
