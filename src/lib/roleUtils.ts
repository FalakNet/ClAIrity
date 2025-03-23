import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Define the role types
export type RoleCode = 'AD' | 'SC' | 'ST';

export interface UserRole {
  role_code: RoleCode;
  role_name: string;
  class_code?: string;
}

// Fetch the user's roles
export async function getUserRoles(user: User | null): Promise<UserRole[]> {
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('user_role_view')
    .select('role_code, role_name, class_code')
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
  
  return data as UserRole[];
}

// Check if user has a specific role
export async function hasRole(user: User | null, roleCode: RoleCode): Promise<boolean> {
  if (!user) return false;
  
  const roles = await getUserRoles(user);
  return roles.some(role => role.role_code === roleCode);
}

// Assign a role to a user
export async function assignRole(userId: string, roleCode: RoleCode, classCode?: string): Promise<boolean> {
  try {
    if (roleCode === 'ST' && classCode) {
      // For student roles, we need to provide a class code
      const { error } = await supabase.rpc('assign_student_role', {
        user_uuid: userId,
        class_code: classCode
      });
      if (error) throw error;
    } else {
      // For admin and counsellor roles
      const { error } = await supabase.rpc('assign_role', {
        user_uuid: userId,
        role_code: roleCode
      });
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
}

// Format a display string for a user role
export function formatRoleDisplay(role: UserRole): string {
  if (role.role_code === 'ST' && role.class_code) {
    return `${role.role_name} (${role.class_code})`;
  }
  return role.role_name;
}
