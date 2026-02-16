import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
const loginSchema = z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
    mpin: z.string().regex(/^\d{4,6}$/, 'MPIN must be 4-6 digits'),
});
const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, loginWithOtp } = useAuthStore();
    const [loginMethod, setLoginMethod] = useState('mpin');
    const [otpStep, setOtpStep] = useState('mobile');
    const [otpMobile, setOtpMobile] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmitMpin = (data) => {
        const success = login(data.mobile, data.mpin);
        if (success) {
            toast.success('Login successful!');
            navigate('/dashboard');
        }
        else {
            toast.error('Invalid mobile number or MPIN');
        }
    };
    const handleSendOtp = () => {
        if (!/^[6-9]\d{9}$/.test(otpMobile)) {
            toast.error('Enter valid 10-digit mobile number');
            return;
        }
        setOtpStep('verify');
        toast.success('OTP sent to your mobile');
    };
    const handleVerifyOtp = () => {
        if (otpValue.length !== 6) {
            toast.error('Please enter 6-digit OTP');
            return;
        }
        const success = loginWithOtp(otpMobile);
        if (success) {
            toast.success('Login successful!');
            navigate('/dashboard');
        }
        else {
            toast.error('Mobile number not registered');
        }
    };
    return (<Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <span className="text-2xl font-bold text-primary-foreground">स</span>
              </div>
            </div>
            <CardTitle className="text-2xl">{t('login')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Login Method Tabs */}
            <div className="flex gap-2 mb-6">
              <Button variant={loginMethod === 'mpin' ? 'default' : 'secondary'} className="flex-1" onClick={() => {
            setLoginMethod('mpin');
            setOtpStep('mobile');
        }}>
                {t('loginWithMpin')}
              </Button>
              <Button variant={loginMethod === 'otp' ? 'default' : 'secondary'} className="flex-1" onClick={() => setLoginMethod('otp')}>
                {t('loginWithOtp')}
              </Button>
            </div>

            {loginMethod === 'mpin' ? (<form onSubmit={handleSubmit(onSubmitMpin)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('mobileNumber')}
                  </label>
                  <Input {...register('mobile')} placeholder="10-digit mobile number" maxLength={10}/>
                  {errors.mobile && (<p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>)}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('mpin')}
                  </label>
                  <Input {...register('mpin')} type="password" placeholder="Enter your MPIN" maxLength={6}/>
                  {errors.mpin && (<p className="text-sm text-destructive mt-1">{errors.mpin.message}</p>)}
                </div>

                <Button type="submit" className="w-full">
                  {t('login')}
                </Button>

                <button type="button" className="w-full text-sm text-primary hover:underline" onClick={() => toast.info('Demo: MPIN reset not available')}>
                  {t('forgotMpin')}
                </button>

                <p className="text-xs text-center text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
                  Demo: Use mobile <strong>9876543210</strong> and MPIN <strong>1234</strong>
                </p>
              </form>) : otpStep === 'mobile' ? (<div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('mobileNumber')}
                  </label>
                  <Input value={otpMobile} onChange={(e) => setOtpMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" maxLength={10}/>
                </div>

                <Button onClick={handleSendOtp} className="w-full">
                  {t('sendOtp')}
                </Button>
              </div>) : (<div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground">
                    Enter the 6-digit OTP sent to
                  </p>
                  <p className="font-medium text-foreground">{otpMobile}</p>
                </div>

                <div>
                  <Input value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" className="text-center text-lg tracking-widest" maxLength={6}/>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Demo: Enter any 6 digits
                  </p>
                </div>

                <Button onClick={handleVerifyOtp} className="w-full">
                  {t('verifyOtp')}
                </Button>

                <Button variant="ghost" className="w-full" onClick={() => setOtpStep('mobile')}>
                  {t('back')}
                </Button>
              </div>)}

            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {t('register')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>);
};
export default Login;
