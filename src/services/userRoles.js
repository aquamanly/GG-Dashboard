import { supabase } from '../supabase';

export const fetchUserRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*');
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
