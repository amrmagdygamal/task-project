import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import Layout from '../components/Layout';
import { useAuthStore, useSignupFormStore } from '../store/authStore';
import Link from 'next/link';

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

const SignupPage = () => {
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
  const [showForm, setShowForm] = useState(false);
  const [accountType, setAccountType] = useState<'user' | 'admin'>('user');
  const router = useRouter();

  useEffect(() => {
    // Clear form on component mount
    reset();
    // Check if account type is specified in URL
    const type = router.query.type as 'user' | 'admin';
    if (type && (type === 'user' || type === 'admin')) {
      setAccountType(type);
      setShowForm(true);
    }
  }, [reset, router.query.type]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    try {
      const result = signupSchema.safeParse({ fullName, email, password });
      if (!result.success) {
        const fieldErrors: { [key: string]: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      const signupResult = await signUp(email, fullName, password, accountType);

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

  // Role selection view
  if (!showForm) {
    return (
      <Layout title="Sign Up">
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-indigo-700 mb-2">
                Join Our Platform
              </h1>

              <p className="text-gray-600">
                Choose how you want to use our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin/Seller Card */}
              <div
                onClick={() => {
                  setAccountType('admin');
                  setShowForm(true);
                }}
                className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="text-center mb-4">
                  <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                    <svg
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Seller Account
                  </h2>

                  <p className="text-gray-600">List and manage your venues</p>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <svg
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Track bookings and revenue
                  </li>

                  <li className="flex items-center text-gray-600">
                    <svg
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Manage venue availability
                  </li>
                </ul>
              </div>

              {/* User Card */}
              <div
                onClick={() => {
                  setAccountType('user');
                  setShowForm(true);
                }}
                className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="text-center mb-4">
                  <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                    <svg
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    User Account
                  </h2>

                  <p className="text-gray-600">Book venues for your events</p>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <svg
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Browse available venues
                  </li>

                  <li className="flex items-center text-gray-600">
                    <svg
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Make and manage bookings
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Registration form view
  return (
    <Layout title={`Sign Up as ${accountType === 'admin' ? 'Seller' : 'User'}`}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg px-8 py-10 border border-indigo-100">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-indigo-700 mb-2">
                Create {accountType === 'admin' ? 'Seller' : 'User'} Account
              </h1>

              {accountType === 'admin' && (
                <p className="text-gray-600">
                  Start managing your venues today
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex rounded-lg border-2 border-indigo-100 p-1">
                <button
                  type="button"
                  onClick={() => setAccountType('user')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    accountType === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  User Account
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('admin')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    accountType === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Seller Account
                </button>
              </div>
            </div>

            {submitError && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 animate-shake">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSignup} noValidate>
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  required
                  className={`block w-full px-4 py-3 rounded-lg border-2 ${
                    errors.fullName
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-indigo-100 focus:border-indigo-300'
                  } focus:ring focus:ring-opacity-50 ${
                    errors.fullName
                      ? 'focus:ring-red-200'
                      : 'focus:ring-indigo-200'
                  } transition-all duration-200`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                />

                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  className={`block w-full px-4 py-3 rounded-lg border-2 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-indigo-100 focus:border-indigo-300'
                  } focus:ring focus:ring-opacity-50 ${
                    errors.email
                      ? 'focus:ring-red-200'
                      : 'focus:ring-indigo-200'
                  } transition-all duration-200`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  className={`block w-full px-4 py-3 rounded-lg border-2 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-indigo-100 focus:border-indigo-300'
                  } focus:ring focus:ring-opacity-50 ${
                    errors.password
                      ? 'focus:ring-red-200'
                      : 'focus:ring-indigo-200'
                  } transition-all duration-200`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />

                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 8 characters and contain at least
                  one uppercase letter, one lowercase letter, and one number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 relative"
              >
                {loading ? (
                  <div className="fl-ro-ce-ce">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign in
                </Link>
              </p>

              <button
                onClick={() => setShowForm(false)}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Back to account type selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
