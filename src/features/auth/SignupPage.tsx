// Benita Granites — Signup Page
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getFirebaseErrorMessage } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup, loginWithGoogle, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await signup(data.email, data.password, data.username);
      toast.success('Account created successfully!');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      toast.error(getFirebaseErrorMessage(firebaseError.code || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      toast.error(getFirebaseErrorMessage(firebaseError.code || ''));
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Left Panel — Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-teal/10 rounded-full blur-3xl translate-x-1/3" />
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-slate-blue/20 rounded-full blur-3xl -translate-x-1/4" />
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
              Join
              <br />
              <span className="text-teal-300">Benita Granites</span>
            </h1>
            <p className="text-lg text-slate-300 mt-4 leading-relaxed max-w-md">
              Get access to the complete mine management platform. Track, manage, and optimize your granite operations.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4">
              {[
                'Real-time production tracking',
                'Complete fuel control & audit',
                'Financial management & reporting',
                'Role-based access control',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-teal-300" />
                  </div>
                  <p className="text-sm text-slate-300">{feature}</p>
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
            <p className="text-sm text-text-secondary mt-1">Create your account</p>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy mb-1">Create Account</h2>
            <p className="text-sm text-text-secondary mb-6">
              Sign up to access the management platform
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" />
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-critical mt-1">{errors.username.message}</p>
                )}
              </div>

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
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Password
                </label>
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
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-critical mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-critical mt-1">{errors.confirmPassword.message}</p>
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
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
              onClick={handleGoogleSignup}
              className="w-full py-3 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover hover:border-border-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-teal font-semibold hover:text-teal-900 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
