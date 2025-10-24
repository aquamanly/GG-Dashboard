import { supabase } from '../supabase';

export const fetchActivityLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('logged_at', { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching activity logs:', err);
    throw err;
  }
};
