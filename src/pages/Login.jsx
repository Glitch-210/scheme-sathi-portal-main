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
  email: z.string().email('Enter valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Using isSubmitting to show loading state
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitMpin = async (data) => {
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Invalid credentials');
        // Optional: set form error
        setError('root', { message: result.error });
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (<Layout showFooter={false}>
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-md animate-fade-in">
        {/* ... Header ... */}
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <span className="text-2xl font-bold text-primary-foreground">स</span>
            </div>
          </div>
          <CardTitle className="text-2xl">{t('login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitMpin)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email
              </label>
              <Input {...register('email')} placeholder="name@example.com" type="email" />
              {errors.email && (<p className="text-sm text-destructive mt-1">{errors.email.message}</p>)}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Password
              </label>
              <Input {...register('password')} type="password" placeholder="Enter your password" />
              {errors.password && (<p className="text-sm text-destructive mt-1">{errors.password.message}</p>)}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : t('login')}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
              Use your registered Email and Password
            </p>
          </form>


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
