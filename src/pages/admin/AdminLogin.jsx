import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { adminLogin, isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();

    // Already authenticated as admin
    if (isAuthenticated && user?.role === 'ADMIN') {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        const result = adminLogin(email, password);
        setLoading(false);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-bg">
                <div className="admin-login-circle c1" />
                <div className="admin-login-circle c2" />
                <div className="admin-login-circle c3" />
            </div>

            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-shield">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground mt-4">Admin Portal</h1>
                    <p className="text-sm text-muted-foreground mt-1">Scheme Sarthi Administration</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && (
                        <div className="admin-login-error">{error}</div>
                    )}

                    <div className="admin-login-field">
                        <label className="text-sm font-medium text-foreground">Email Address</label>
                        <div className="admin-login-input-wrap">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@schemesarthi.gov.in" className="admin-login-input" autoComplete="email" />
                        </div>
                    </div>

                    <div className="admin-login-field">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <div className="admin-login-input-wrap">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" className="admin-login-input" autoComplete="current-password" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="admin-login-btn">
                        {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating…</>
                        ) : 'Sign In'}
                    </button>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Authorized personnel only. All activities are monitored.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
