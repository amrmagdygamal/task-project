/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

const Header = () => {
  const { session } = useAuthStore();
  const router = useRouter();
  console.log('Header session:', session);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <div className="flex items-center gap-2">
        <img src="/window.svg" alt="Logo" className="h-8 w-8" />
        <span className="text-xl font-bold text-indigo-700">Booking Platform</span>
      </div>
      <nav className="flex items-center gap-4">
        <Link href="/venues" className="text-gray-700 hover:text-indigo-600">Venues</Link>
        {session && session.user && (
          <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
        )}
        <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
          <span className="material-icons align-middle">shopping_cart</span> Cart
        </Link>
        <Link href="/bookings" className="text-gray-700 hover:text-indigo-600">My Bookings</Link>
        {session ? (
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Logout</button>
        ) : (
          <Link href="/login" className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
