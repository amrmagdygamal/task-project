import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../utils/supabase';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useAuthStore } from '../../store/authStore';
import { useVenueDetailStore } from '../../store/venueDetailStore';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

const VenueDetail = () => {
  const { session } = useAuthStore();
  const router = useRouter();
  const { id } = router.query;
  const {
    venue, loading, reviews, reviewForm, reservations, booking, bookingErrors, bookingSuccess,
    setVenue, setLoading, setReviews, setReviewForm, setReservations, setBooking, setBookingErrors, setBookingSuccess
  } = useVenueDetailStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchVenue = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('venues').select('*').eq('id', id).single();
      if (!error && data) setVenue(data);
      setLoading(false);
    };
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user:users(full_name, profile)')
        .eq('venue_id', id)
        .order('created_at', { ascending: false });
      if (!error && data) setReviews(data);
    };
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('venue_id', id)
        .order('created_at', { ascending: false });
      if (!error && data) setReservations(data);
    };
    fetchVenue();
    fetchReviews();
    fetchReservations();
  }, [id, setVenue, setLoading, setReviews, setReservations]);
  const handleDownloadPDF = async () => {
    if (!venue) return;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header with blue background
    page.drawRectangle({
      x: 0,
      y: 792,
      width: 595,
      height: 50,
      color: rgb(0.23, 0.38, 0.85), // Indigo color
    });

    // Title
    page.drawText('VENUE DETAILS', {
      x: 50,
      y: 810,
      size: 24,
      font: helveticaBold,
      color: rgb(1, 1, 1)
    });

    // Venue name with underline
    page.drawText(venue.name, {
      x: 50,
      y: 750,
      size: 20,
      font: helveticaBold,
      color: rgb(0.23, 0.38, 0.85)
    });
    page.drawLine({
      start: { x: 50, y: 745 },
      end: { x: 545, y: 745 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });

    // Details section
    const details = [
      { label: 'Address', value: venue.address },
      { label: 'Capacity', value: `${venue.capacity} people` },
      { label: 'Day Price', value: `$${venue.dayprice}` },
      { label: 'Description', value: venue.description || 'No description available' }
    ];

    let yPosition = 700;
    details.forEach(({ label, value }) => {
      page.drawText(label + ':', {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3)
      });
      page.drawText(value, {
        x: 150,
        y: yPosition,
        size: 12,
        font: helvetica,
        color: rgb(0, 0, 0)
      });
      yPosition -= 30;
    });

    // Image section
    if (venue.image_url) {
      try {
        const imgBytes = await fetch(venue.image_url).then(res => res.arrayBuffer());
        let image;
        if (venue.image_url.endsWith('.png')) {
          image = await pdfDoc.embedPng(imgBytes);
        } else {
          image = await pdfDoc.embedJpg(imgBytes);
        }
        
        // Add image title
        page.drawText('Venue Image:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: helveticaBold,
          color: rgb(0.3, 0.3, 0.3)
        });
        
        // Calculate aspect ratio for image
        const imgWidth = 300;
        const imgHeight = (image.height / image.width) * imgWidth;
        
        page.drawImage(image, {
          x: 50,
          y: yPosition - imgHeight - 10,
          width: imgWidth,
          height: imgHeight
        });
      } catch (e) {}
    }
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${venue.name}-info.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !session) return;
    setActionLoading(true);
    const result = bookingSchema.safeParse(booking);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setBookingErrors(fieldErrors);
      setActionLoading(false);
      return;
    }
    setBookingErrors({});
    // Calculate number of days
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const finalPrice = days * (venue.dayprice || 0);
    // Redirect to payment page with booking details and price
    router.push({
      pathname: '/payment',
      query: {
        venue_id: venue.id,
        name: booking.name,
        phone: booking.phone,
        startDate: booking.startDate,
        endDate: booking.endDate,
        days,
        finalPrice
      }
    });
    setActionLoading(false);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !session) return;
    setActionLoading(true);
    const { error } = await supabase.from('reviews').insert([
      {
        venue_id: venue.id,
        userId: session.user.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        created_at: new Date().toISOString(),
      },
    ]);
    if (!error) {
      setReviewForm({ rating: 5, comment: '' });
      const { data } = await supabase
        .from('reviews')
        .select('*, user:users(full_name, profile)')
        .eq('venue_id', id)
        .order('created_at', { ascending: false });
      setReviews(data || []);
      setToast({ message: 'Review submitted!', type: 'success' });
    } else {
      setToast({ message: 'Review failed. Please try again.', type: 'error' });
    }
    setActionLoading(false);
  };
  // Calculate total price based on number of days
  const calculateTotalPrice = (startDate: string, endDate: string, dayPrice: number) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * dayPrice;
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast.message) {
      const t = setTimeout(() => setToast({ message: '', type: '' }), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (!venue) return <Layout><div>Venue not found.</div></Layout>;

  return (
    <Layout title={venue.name}>
      <div className="max-w-2xl mx-auto py-8 px-2 sm:px-0">
        <h1 className="text-3xl font-bold mb-2 text-indigo-700" tabIndex={0}>{venue?.name}</h1>
        {venue?.image_url && <img src={venue.image_url} alt={venue.name} className="w-full h-60 object-cover rounded-xl mb-4 shadow" />}
        <p className="mb-1"><b>Address:</b> {venue?.address}</p>
        <p className="mb-1"><b>Capacity:</b> {venue?.capacity}</p>
        <p className="mb-1"><b>Day Price:</b> <span className="text-indigo-700 font-semibold">{venue?.dayprice}</span></p>
        <p className="mb-1"><b>Description:</b> {venue?.description}</p>
        <p className="mb-4"><b>Created:</b> {venue?.created_at}</p>
        <button
          className="mb-4 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={handleDownloadPDF}
          aria-label="Download venue information as PDF"
        >
          Download PDF
        </button>
        <hr className="my-6" />
        <h2 className="text-xl font-semibold mb-2 text-indigo-700" tabIndex={0}>Book this venue</h2>
        {!session ? (
          <div className="mb-4 text-red-600 font-semibold" role="alert">You must be logged in to book this venue.</div>
        ) : null}
        {session && (
        <form onSubmit={handleBooking} className="space-y-3" aria-disabled={!session} autoComplete="off">
          <label htmlFor="booking-name" className="sr-only">Your Name</label>
          <input id="booking-name" name="name" value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} required placeholder="Your Name" className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base" aria-label="Your Name" />
          {bookingErrors.name && <div className="text-red-500 text-sm" role="alert">{bookingErrors.name}</div>}
          <label htmlFor="booking-phone" className="sr-only">Phone Number</label>
          <input id="booking-phone" name="phone" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} required placeholder="Phone Number" className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base" aria-label="Phone Number" />
          {bookingErrors.phone && <div className="text-red-500 text-sm" role="alert">{bookingErrors.phone}</div>}
          <label htmlFor="booking-start-date" className="sr-only">Start Date</label>
          <input id="booking-start-date" name="startDate" type="date" value={booking.startDate} onChange={e => setBooking({ ...booking, startDate: e.target.value })} required className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base" aria-label="Start Date" />
          {bookingErrors.startDate && <div className="text-red-500 text-sm" role="alert">{bookingErrors.startDate}</div>}
          <label htmlFor="booking-end-date" className="sr-only">End Date</label>
          <input id="booking-end-date" name="endDate" type="date" value={booking.endDate} onChange={e => setBooking({ ...booking, endDate: e.target.value })} required className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base" aria-label="End Date" />
          {bookingErrors.endDate && <div className="text-red-500 text-sm" role="alert">{bookingErrors.endDate}</div>}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" aria-label="Book this venue">Book</button>
          </div>
        </form>
        )}
        <hr className="my-6" />
        <h2 className="text-xl font-semibold mb-2 text-indigo-700" tabIndex={0}>Leave a review</h2>
        {session && (
        <form onSubmit={handleReview} className="space-y-3 mt-6" autoComplete="off">
          <label htmlFor="review-rating" className="block font-medium">Rating:</label>
          <select id="review-rating" name="rating" value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} className="ml-0 sm:ml-2 p-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base" aria-label="Rating">
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <label htmlFor="review-comment" className="sr-only">Your review</label>
          <textarea id="review-comment" name="comment" value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required placeholder="Your review" className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-base" aria-label="Your review" />
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" aria-label="Submit review">Submit Review</button>
        </form>
        )}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-indigo-700" tabIndex={0}>Reviews</h3>
          {reviews.length === 0 ? (
            <div className="text-gray-400">No reviews yet.</div>
          ) : (
            <ul className="space-y-2">
              {reviews.map((r, i) => (
                <li key={i} className="border-b last:border-b-0 pb-2" tabIndex={0} aria-label={`Review by ${r.user?.full_name || r.userId}`}> 
                  <div className="font-semibold">{r.user?.full_name || r.userId}</div>
                  <div className="text-yellow-500" aria-label={`Rating: ${r.rating} out of 5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <div>{r.comment}</div>
                  <div className="text-xs text-gray-400">{r.created_at}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {toast.message && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} role="status" aria-live="polite">{toast.message}</div>
        )}
        {(loading || actionLoading) ? (
          <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600 focus:outline-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading spinner"
              tabIndex={0}
              focusable="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : (
          <div className="py-12" aria-hidden="true" />
        )}
      </div>
    </Layout>
  );
};

export default VenueDetail;
