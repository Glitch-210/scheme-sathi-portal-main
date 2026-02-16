import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation, languageNames } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    mpin: z.string().regex(/^\d{4,6}$/, 'MPIN must be 4-6 digits'),
    confirmMpin: z.string(),
    language: z.enum(['en', 'hi', 'gu']),
}).refine((data) => data.mpin === data.confirmMpin, {
    message: "MPINs don't match",
    path: ['confirmMpin'],
});
const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register: registerUser } = useAuthStore();
    const [step, setStep] = useState('form');
    const [otpValue, setOtpValue] = useState('');
    const [formData, setFormData] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            language: 'en',
        },
    });
    const onSubmit = (data) => {
        setFormData(data);
        setStep('otp');
        toast.success('OTP sent to your mobile number');
    };
    const handleVerifyOtp = () => {
        if (otpValue.length !== 6) {
            toast.error('Please enter 6-digit OTP');
            return;
        }
        // Simulate OTP verification (always succeeds with any 6-digit code)
        if (formData) {
            const success = registerUser({
                fullName: formData.fullName,
                mobile: formData.mobile,
                email: formData.email || undefined,
                mpin: formData.mpin,
                language: formData.language,
            });
            if (success) {
                toast.success('Registration successful!');
                navigate('/dashboard');
            }
            else {
                toast.error('Mobile number already registered');
                setStep('form');
            }
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
            <CardTitle className="text-2xl">{t('register')}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'form' ? (<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('fullName')} *
                  </label>
                  <Input {...register('fullName')} placeholder="Enter your full name"/>
                  {errors.fullName && (<p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>)}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('mobileNumber')} *
                  </label>
                  <Input {...register('mobile')} placeholder="10-digit mobile number" maxLength={10}/>
                  {errors.mobile && (<p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>)}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('email')}
                  </label>
                  <Input {...register('email')} type="email" placeholder="email@example.com"/>
                  {errors.email && (<p className="text-sm text-destructive mt-1">{errors.email.message}</p>)}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('mpin')} *
                  </label>
                  <Input {...register('mpin')} type="password" placeholder="4-6 digit MPIN" maxLength={6}/>
                  {errors.mpin && (<p className="text-sm text-destructive mt-1">{errors.mpin.message}</p>)}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('confirmMpin')} *
                  </label>
                  <Input {...register('confirmMpin')} type="password" placeholder="Confirm your MPIN" maxLength={6}/>
                  {errors.confirmMpin && (<p className="text-sm text-destructive mt-1">{errors.confirmMpin.message}</p>)}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('selectLanguage')}
                  </label>
                  <select {...register('language')} className="flex h-12 w-full rounded-lg border-2 border-input bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary">
                    {Object.keys(languageNames).map((lang) => (<option key={lang} value={lang}>
                        {languageNames[lang]}
                      </option>))}
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {t('sendOtp')}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    {t('login')}
                  </Link>
                </p>
              </form>) : (<div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">
                    Enter the 6-digit OTP sent to your mobile
                  </p>
                  <p className="font-medium text-foreground">{formData?.mobile}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t('otp')}
                  </label>
                  <Input value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" className="text-center text-lg tracking-widest" maxLength={6}/>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Demo: Enter any 6 digits
                  </p>
                </div>

                <Button onClick={handleVerifyOtp} className="w-full">
                  {t('verifyOtp')}
                </Button>

                <Button variant="ghost" className="w-full" onClick={() => setStep('form')}>
                  {t('back')}
                </Button>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </Layout>);
};
export default Register;
