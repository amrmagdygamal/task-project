import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useBookingsStore } from '../store/bookingsStore';
import Image from 'next/image';

const BookingsPage = () => {
  const router = useRouter();
  const { session } = useAuthStore();
  const { bookings, loading, fetchBookings } = useBookingsStore();
  const { success } = router.query;

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings(session.user.id);
    }
  }, [session?.user?.id, fetchBookings]);

  return (
    <Layout title="My Bookings">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
            role="alert"
          >
            <p className="font-bold">Payment Successful!</p>

            <p>Your booking has been confirmed.</p>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-indigo-700">My Bookings</h1>

        {loading ? (
          <div className="fl-ro-ce-ce py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {booking.venues?.image_url && (
                  <div className="relative h-48">
                    
                    <Image
                      src={booking.venues.image_url}
                      alt={booking.venues.name || 'Venue image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {booking.venues?.name}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Booking Date:</span>
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>

                    <p>
                      <span className="font-semibold">Check-in:</span>
                      {new Date(booking.start_date).toLocaleDateString()}
                    </p>

                    <p>
                      <span className="font-semibold">Check-out:</span>
                      {new Date(booking.end_date).toLocaleDateString()}
                    </p>

                    <p>
                      <span className="font-semibold">Total Amount:</span>$
                      {booking.total_price.toFixed(2)}
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
