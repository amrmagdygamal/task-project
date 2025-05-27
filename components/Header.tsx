/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

const Header = () => {
  const { session, role } = useAuthStore();
  const router = useRouter();
  // console.log('Header session:', session);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="fl-ro-ce-be px-6 py-4 bg-white shadow">
      <div className="fl-ro-ce-stgap-2" onClick={() => router.push('/')}>
        <img src="/window.svg" alt="Logo" className="h-8 w-8" />

        <span className="text-xl font-bold text-indigo-700">
          Booking Platform
        </span>
      </div>

      <nav className="fl-ro-ce-stgap-4">
        {session && role === 'admin' && (
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-indigo-600"
          >
            Dashboard
          </Link>
        )}
        {session ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <>
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Login
          </Link>
          <Link
            href="/acount"
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Signup
          </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
