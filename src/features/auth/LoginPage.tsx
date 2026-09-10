// Benita Granites — Login Page
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getFirebaseErrorMessage } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loginWithGoogle, user, loading: authLoading, resetPassword } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Already logged in → redirect
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      toast.error(getFirebaseErrorMessage(firebaseError.code || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      toast.error(getFirebaseErrorMessage(firebaseError.code || ''));
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    try {
      await resetPassword(resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setForgotPasswordMode(false);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      toast.error(getFirebaseErrorMessage(firebaseError.code || ''));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Left Panel — Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-blue/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/10">
              <span className="text-white font-bold text-2xl">BG</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Benita
              <br />
              <span className="text-teal-300">Granites</span>
            </h1>
            <p className="text-lg text-slate-300 mt-4 leading-relaxed max-w-md">
              Mine Management Information System.
              Track production, inventory, fuel, expenses, and operations — all in one platform.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              {[
                { label: 'Modules', value: '13+' },
                { label: 'Real-time', value: '24/7' },
                { label: 'Analytics', value: 'Live' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">BG</span>
            </div>
            <h1 className="text-2xl font-bold text-navy">Benita Granites</h1>
            <p className="text-sm text-text-secondary mt-1">Mine Management MIS</p>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-lg p-6 sm:p-8">
            {forgotPasswordMode ? (
              /* Forgot Password Form */
              <>
                <h2 className="text-xl font-bold text-navy mb-2">Reset Password</h2>
                <p className="text-sm text-text-secondary mb-6">
                  Enter your email to receive a password reset link.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleResetPassword}
                    className="w-full py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors shadow-sm"
                  >
                    Send Reset Link
                  </button>
                  <button
                    onClick={() => setForgotPasswordMode(false)}
                    className="w-full py-2 text-sm text-text-secondary hover:text-navy transition-colors"
                  >
                    ← Back to login
                  </button>
                </div>
              </>
            ) : (
              /* Login Form */
              <>
                <h2 className="text-xl font-bold text-navy mb-1">Welcome back</h2>
                <p className="text-sm text-text-secondary mb-6">
                  Sign in to your management dashboard
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-critical mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-text-primary">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordMode(true)}
                        className="text-xs text-teal hover:text-teal-900 font-medium transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" />
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-[18px] h-[18px]" />
                        ) : (
                          <Eye className="w-[18px] h-[18px]" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-critical mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-text-tertiary font-medium">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover hover:border-border-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Footer */}
                <p className="text-center text-sm text-text-secondary mt-6">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-teal font-semibold hover:text-teal-900 transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
