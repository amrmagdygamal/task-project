import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useVenueDetailStore } from '../../store/venueDetailStore';

const VenueDetail = () => {
  const { session } = useAuthStore();
  const router = useRouter();
  const { id } = router.query;
  const {
    venue,
    loading,
    booking,
    bookingErrors,
    setVenue,
    setLoading,
    setReservations,
    setBooking,
    setBookingErrors,
    fetchVenue,
    fetchReservations,
    generatePDF,
    validateBooking,
    calculateBookingPrice,
  } = useVenueDetailStore();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | '';
  }>({ message: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchVenue(id as string);
    fetchReservations(id as string);
  }, [id, fetchVenue, fetchReservations]);

  const handleDownloadPDF = async () => {
    if (!venue) return;
    await generatePDF(venue);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !session) return;
    setActionLoading(true);

    const { isValid, errors } = validateBooking();
    if (!isValid) {
      setBookingErrors(errors);
      setActionLoading(false);
      return;
    }

    const priceCalculation = calculateBookingPrice();
    if (!priceCalculation) {
      setActionLoading(false);
      return;
    }

    const { days, finalPrice } = priceCalculation;
    router.push({
      pathname: '/payment',
      query: {
        venue_id: venue.id,
        name: booking.name,
        phone: booking.phone,
        startDate: booking.startDate,
        endDate: booking.endDate,
        days,
        finalPrice,
      },
    });
    setActionLoading(false);
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast.message) {
      const t = setTimeout(() => setToast({ message: '', type: '' }), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  if (!venue)
    return (
      <Layout>
        <div>Venue not found.</div>
      </Layout>
    );

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout title={venue.name}>
      <div className="max-w-2xl mx-auto py-8 px-2 sm:px-0">
        <h1 className="text-3xl font-bold mb-2 text-indigo-700" tabIndex={0}>
          {venue?.name}
        </h1>

        {venue?.image_url && (
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-60 object-cover rounded-xl mb-4 shadow"
          />
        )}
        <p className="mb-1">
          <b>Address:</b>
          {venue?.address}
        </p>

        <p className="mb-1">
          <b>Capacity:</b>
          {venue?.capacity}
        </p>

        <p className="mb-1">
          <b>Day Price:</b>
          <span className="text-indigo-700 font-semibold">
            {venue?.dayprice}
          </span>
        </p>

        <p className="mb-1">
          <b>Description:</b>
          {venue?.description}
        </p>

        <button
          className="mb-4 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={handleDownloadPDF}
          aria-label="Download venue information as PDF"
        >
          Download PDF
        </button>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-2 text-indigo-700" tabIndex={0}>
          Book this venue
        </h2>

        {!session ? (
          <div className="mb-4 text-red-600 font-semibold" role="alert">
            You must be logged in to book this venue.
          </div>
        ) : null}
        {session && (
          <form
            onSubmit={handleBooking}
            className="space-y-3"
            aria-disabled={!session}
            autoComplete="off"
          >
            <div>
              <label
                htmlFor="booking-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>

              <input
                id="booking-name"
                name="name"
                value={booking.name}
                onChange={(e) =>
                  setBooking({ ...booking, name: e.target.value })
                }
                required
                placeholder="Your Name"
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base"
                aria-label="Your Name"
              />

              {bookingErrors.name && (
                <div className="text-red-500 text-sm mt-1" role="alert">
                  {bookingErrors.name}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="booking-phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>

              <input
                id="booking-phone"
                name="phone"
                value={booking.phone}
                onChange={(e) =>
                  setBooking({ ...booking, phone: e.target.value })
                }
                required
                placeholder="Phone Number"
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base"
                aria-label="Phone Number"
              />

              {bookingErrors.phone && (
                <div className="text-red-500 text-sm mt-1" role="alert">
                  {bookingErrors.phone}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="booking-start-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>

              <input
                id="booking-start-date"
                name="startDate"
                type="date"
                min={today}
                value={booking.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  setBooking({ ...booking, startDate: newStartDate });
                  // If end date is before new start date, update it
                  if (booking.endDate && newStartDate > booking.endDate) {
                    setBooking({
                      ...booking,
                      startDate: newStartDate,
                      endDate: newStartDate,
                    });
                  }
                }}
                required
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  color: 'black',
                  width: '20rem',
                }}
                aria-label="Start Date"
              />

              {bookingErrors.startDate && (
                <div className="text-red-500 text-sm mt-1" role="alert">
                  {bookingErrors.startDate}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="booking-end-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>

              <input
                id="booking-end-date"
                name="endDate"
                type="date"
                min={booking.startDate || today}
                value={booking.endDate}
                onChange={(e) =>
                  setBooking({ ...booking, endDate: e.target.value })
                }
                required
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  color: 'black',
                  width: '20rem',
                }}
                aria-label="End Date"
              />

              {bookingErrors.endDate && (
                <div className="text-red-500 text-sm mt-1" role="alert">
                  {bookingErrors.endDate}
                </div>
              )}
            </div>

            <div className="fl-co-st-st sm:flex-row gap-2 mt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base disabled:opacity-50"
                aria-label="Book this venue"
              >
                {actionLoading ? 'Processing...' : 'Book'}
              </button>
            </div>
          </form>
        )}

        {toast.message && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        )}

        {actionLoading && (
          <div className="fl-ro-ce-ce py-12" role="status" aria-live="polite">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600 focus:outline-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading spinner"
              tabIndex={0}
              focusable="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VenueDetail;
