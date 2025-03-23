import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Gets the formatted display name from a user object
 */
export const getDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  
  const firstName = user.user_metadata?.first_name;
  const lastName = user.user_metadata?.last_name;
  
  if (!firstName && !lastName) return 'User';
  return [firstName, lastName].filter(Boolean).join(' ').trim() || 'User';
};

/**
 * Saves user data to anxious_summaries with proper UUID
 */
export async function saveUserEntry(
  userId: string | undefined,
  userName: string,
  userInput: string,
  aiOutput: string,
  severity: string
) {
  if (!userId) {
    console.error('No user ID available');
    return { error: 'No user ID available' };
  }
  
  try {
    const { error } = await supabase.from('anxious_summaries').insert([{
      user_id: userId,
      user: userName,
      user_input: userInput,
      ai_output: aiOutput,
      severity: severity,
      created_at: new Date().toISOString()
    }]);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving user entry:', error);
    return { error };
  }
}

/**
 * Fetches all entries for a specific user by UUID
 */
export async function getUserEntries(userId: string) {
  try {
    const { data, error } = await supabase
      .from('anxious_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching user entries:', error);
    return { error };
  }
}
