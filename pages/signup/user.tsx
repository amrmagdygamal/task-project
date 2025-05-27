import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import Layout from '../../components/Layout';
import { useAuthStore, useSignupFormStore } from '../../store/authStore';
import Link from 'next/link';

const signupSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

const SignupUser = () => {
  const { loading, signUp } = useAuthStore();
  const {
    email,
    fullName,
    password,
    errors,
    setEmail,
    setFullName,
    setPassword,
    setErrors,
    reset,
  } = useSignupFormStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Clear form 
    reset();
  }, [reset]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    try {
      const result = signupSchema.safeParse({ fullName, email, password });
      if (!result.success) {
        const fieldErrors: { [key: string]: string } = {};
        result.error.errors.forEach(err => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }      const signupResult = await signUp(email, fullName, password, 'user');
      
      if (signupResult.success) {
        reset();
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setSubmitError(signupResult.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Layout title="Sign Up as Seller">
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg px-8 py-10 border border-indigo-100">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-indigo-700 mb-2">
                Create User Account
              </h1>
            </div>

            {submitError && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 animate-shake">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSignup} noValidate>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className={`block w-full px-4 py-3 rounded-lg border-2 ${
                    errors.fullName ? 'border-red-300 focus:border-red-400' : 'border-indigo-100 focus:border-indigo-300'
                  } focus:ring focus:ring-opacity-50 ${
                    errors.fullName ? 'focus:ring-red-200' : 'focus:ring-indigo-200'
                  } transition-all duration-200`}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className={`block w-full px-4 py-3 rounded-lg border-2 ${
                    errors.email ? 'border-red-300 focus:border-red-400' : 'border-indigo-100 focus:border-indigo-300'
                  } focus:ring focus:ring-opacity-50 ${
                    errors.email ? 'focus:ring-red-200' : 'focus:ring-indigo-200'
                  } transition-all duration-200`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className={`block w-full px-4 py-3 rounded-lg border-2 ${
                    errors.password ? 'border-red-300 focus:border-red-400' : 'border-indigo-100 focus:border-indigo-300'
                  } focus:ring focus:ring-opacity-50 ${
                    errors.password ? 'focus:ring-red-200' : 'focus:ring-indigo-200'
                  } transition-all duration-200`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 8 characters and contain at least one uppercase letter, 
                  one lowercase letter, and one number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 relative"
              >
                {loading ? (
                  <div className="fl-ro-ce-ce">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupUser;
