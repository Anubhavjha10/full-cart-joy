import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const checkUserRole = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('has_role', { 
    _user_id: userId, 
    _role: 'admin' 
  });
  if (error) {
    console.error('Error checking role:', error);
    return false;
  }
  return data === true;
};

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const isAdmin = await checkUserRole(user.id);
        navigate(isAdmin ? '/admin' : '/', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
