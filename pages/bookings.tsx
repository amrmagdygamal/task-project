import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';

interface Booking {
  id: string;
  venue_id: string;
  name: string;
  phone: string;
  startDate: string;
  endDate: string;
  status: string;
  amount_paid: number;
  days: number;
  created_at: string;
  venue: {
    name: string;
    image_url?: string;
  };
}

const BookingsPage = () => {
  const router = useRouter();
  const { session } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, session_id } = router.query;

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    fetchBookings();
  }, [session]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          venue:venues (
            name,
            image_url
          )
        `)
        .eq('userId', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Bookings">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-bold">Payment Successful!</p>
            <p>Your booking has been confirmed.</p>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-indigo-700">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {booking.venue?.image_url && (
                  <div className="relative h-48">
                    <img
                      src={booking.venue.image_url}
                      alt={booking.venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{booking.venue?.name}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Booking Name:</span> {booking.name}</p>
                    <p><span className="font-semibold">Phone:</span> {booking.phone}</p>
                    <p><span className="font-semibold">Check-in:</span> {new Date(booking.startDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Check-out:</span> {new Date(booking.endDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Duration:</span> {booking.days} days</p>
                    <p><span className="font-semibold">Amount Paid:</span> ${booking.amount_paid.toFixed(2)}</p>
                    <p>
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingsPage;
