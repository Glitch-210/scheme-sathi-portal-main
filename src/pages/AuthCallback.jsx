import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            // Supabase client automatically handles the session exchange from URL hash/query
            // when using the standard client. However, checking getSession() ensures
            // the session is established before navigating.
            const { error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during auth callback:', error);
                // Optionally navigate to login or show error
                navigate('/login');
            } else {
                // Successful exchange or session exists
                navigate('/dashboard');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Verifying your account...</p>
        </div>
    );
};

export default AuthCallback;
