import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAdminCheck(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAdminStatus() {
      setIsLoading(true);
      
      // If no user ID, they're not an admin
      if (!userId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Check admin_users table for the user's ID
      // Using 'id' column instead of 'uuid' based on the error message
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data); // Convert to boolean
      }
      
      setIsLoading(false);
    }
    
    checkAdminStatus();
  }, [userId]);
  
  return { isAdmin, isLoading };
}
