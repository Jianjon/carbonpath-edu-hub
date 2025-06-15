
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdminStatus = useCallback(async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
    
    const isAdminResult = data?.is_admin || false;
    setIsAdmin(isAdminResult);
    return isAdminResult;
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
            setTimeout(() => {
                checkAdminStatus(currentUser);
            }, 0);
        } else {
            setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
            checkAdminStatus(currentUser).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    navigate('/');
    setLoading(false);
  };

  return { user, session, isAdmin, loading, logout };
};
