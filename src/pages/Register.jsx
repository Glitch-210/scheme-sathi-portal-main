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
  mobile: z.string().regex(/^\d{10}$/, 'Enter valid 10-digit mobile number'),
  email: z.string().email('Valid email is required for account'),
  mpin: z.string().min(6, 'Password must be at least 6 characters'),
  confirmMpin: z.string(),
  language: z.enum(['en', 'hi', 'gu']),
}).refine((data) => data.mpin === data.confirmMpin, {
  message: "Passwords don't match",
  path: ['confirmMpin'],
});

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  // const [otpValue, setOtpValue] = useState(''); // Removing OTP step for Supabase email signup
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      language: 'en',
    },
  });

  const onSubmit = async (data) => {
    // Direct registration with Supabase (Email/Password)
    // Skipping OTP step as Supabase handles email verification sending (if enabled)
    // or just creates the user.

    try {
      const result = await registerUser({
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        password: data.mpin, // Using MPIN field as Password
        language: data.language,
      });

      if (result.success) {
        toast.success('Registration successful! Check your email for verification if enabled.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
        if (result.error && result.error.includes('already registered')) {
          setError('email', { message: 'Email already registered' });
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  // Removing handleVerifyOtp as we are doing direct registration for this task scope

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t('fullName')} *
              </label>
              <Input {...register('fullName')} placeholder="Enter your full name" />
              {errors.fullName && (<p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>)}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t('mobileNumber')} *
              </label>
              <Input {...register('mobile')} placeholder="10-digit mobile number" maxLength={10} />
              {errors.mobile && (<p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>)}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t('email')} *
              </label>
              <Input {...register('email')} type="email" placeholder="email@example.com" />
              {errors.email && (<p className="text-sm text-destructive mt-1">{errors.email.message}</p>)}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Password *
              </label>
              <Input {...register('mpin')} type="password" placeholder="Create a password (min 6 chars)" />
              {errors.mpin && (<p className="text-sm text-destructive mt-1">{errors.mpin.message}</p>)}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Confirm Password *
              </label>
              <Input {...register('confirmMpin')} type="password" placeholder="Confirm password" />
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
              {isSubmitting ? 'Registering...' : t('register')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t('login')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  </Layout>);
};
export default Register;
