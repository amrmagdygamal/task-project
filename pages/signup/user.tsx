import { useRouter } from 'next/router';
import { z } from 'zod';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useSignupFormStore } from '../../store/authStore';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse({ fullName, email, password });
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await signUp(email, fullName, password, 'user');
    reset();
    router.push('/venues');
  };

  return (
    <Layout title="Sign Up as User">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-indigo-100">
          <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Sign up as User</h1>
          <form className="space-y-5" onSubmit={handleSignup}>
            <input type="text" required placeholder="Full Name" className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400" value={fullName} onChange={e => setFullName(e.target.value)} />
            {errors.fullName && <div className="text-red-500 text-sm">{errors.fullName}</div>}
            <input type="email" required placeholder="Email" className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400" value={email} onChange={e => setEmail(e.target.value)} />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
            <input type="password" required placeholder="Password" className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400" value={password} onChange={e => setPassword(e.target.value)} />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-all duration-150 shadow-md disabled:opacity-60">{loading ? 'Signing up...' : 'Sign Up'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignupUser;
