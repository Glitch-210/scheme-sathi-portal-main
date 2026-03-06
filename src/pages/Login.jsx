import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

const emailSchema = z.object({
  email: z.string().email('Enter valid email address'),
});

const otpSchema = z.object({
  token: z.string().min(6, 'OTP must be at least 6 characters'),
});

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, isAuthenticated, isAuthChecking } = useAuthStore();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors, isSubmitting: isSubmittingEmail } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors, isSubmitting: isSubmittingOtp }, setError: setOtpError } = useForm({
    resolver: zodResolver(otpSchema),
  });

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmitEmail = async (data) => {
    try {
      const result = await sendOtp(data.email);
      if (result.success) {
        toast.success('OTP sent to your email!');
        setEmail(data.email);
        setStep('otp');
        setCountdown(30);
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  const onSubmitOtp = async (data) => {
    try {
      const result = await verifyOtp(email, data.token);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Invalid OTP');
        setOtpError('token', { message: result.error || 'Invalid OTP' });
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      const result = await sendOtp(email);
      if (result.success) {
        toast.success('OTP resent to your email!');
        setCountdown(30);
      } else {
        toast.error(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <span className="text-2xl font-bold text-primary-foreground">स</span>
              </div>
            </div>
            <CardTitle className="text-2xl">{t('citizenLogin')}</CardTitle>
            <CardDescription>{t('loginDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <>
                <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t('emailAddress')}
                    </label>
                    <Input {...registerEmail('email')} placeholder="name@example.com" type="email" />
                    {emailErrors.email && (<p className="text-sm text-destructive mt-1">{emailErrors.email.message}</p>)}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmittingEmail}>
                    {isSubmittingEmail ? t('sendingOtp') : t('sendOtp')}
                  </Button>
                </form>


              </>
            ) : (
              <form onSubmit={handleSubmitOtp(onSubmitOtp)} className="space-y-4 pt-4">
                <div className="bg-muted p-3 flex justify-between items-center rounded-md mb-2">
                  <span className="text-sm font-medium">{email}</span>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setStep('email')} className="h-8 px-2 text-xs">
                    Edit
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('enterOtpSent')}
                  </label>
                  <Input {...registerOtp('token')} placeholder="123456" autoComplete="one-time-code" />
                  {otpErrors.token && (<p className="text-sm text-destructive mt-1">{otpErrors.token.message}</p>)}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmittingOtp}>
                  {isSubmittingOtp ? t('verifying') : t('verifyLogin')}
                </Button>
                <div className="text-center mt-4">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `${t('resendOtpIn')} ${countdown}s` : t('resendOtp')}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-muted-foreground">
                {t('noAccount')}{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {t('register')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
