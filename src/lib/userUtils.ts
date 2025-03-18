import { User } from '@supabase/supabase-js';

/**
 * Gets the formatted display name from a user object
 */
export const getDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  
  // For debugging - log the actual metadata
  console.log('User metadata:', user.user_metadata);
  
  const firstName = user.user_metadata?.first_name;
  const lastName = user.user_metadata?.last_name;
  
  if (!firstName && !lastName) return 'User';
  return [firstName, lastName].filter(Boolean).join(' ').trim() || 'User';
};
