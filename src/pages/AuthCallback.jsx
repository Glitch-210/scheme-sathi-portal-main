import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const checkSession = useAuthStore((s) => s.checkSession);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Check for PKCE code in URL query params (email confirmation flow)
                const code = searchParams.get('code');

                if (code) {
                    // Exchange the code for a session (PKCE flow)
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) {
                        console.error('Code exchange failed:', exchangeError);
                        setError(exchangeError.message);
                        setTimeout(() => navigate('/login'), 3000);
                        return;
                    }
                }

                // Sync auth state with the store
                await checkSession();

                // Redirect to dashboard
                navigate('/dashboard', { replace: true });
            } catch (err) {
                console.error('Auth callback error:', err);
                setError('Authentication failed. Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleAuthCallback();
    }, [navigate, searchParams, checkSession]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            {error ? (
                <>
                    <div className="text-destructive text-lg font-medium mb-2">⚠️ {error}</div>
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </>
            ) : (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Verifying your account...</p>
                </>
            )}
        </div>
    );
};

export default AuthCallback;
