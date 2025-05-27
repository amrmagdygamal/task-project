import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentPage = () => {
  const router = useRouter();
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { venue_id, name, phone, startDate, endDate, days, finalPrice } = router.query;

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
    if (!venue_id || !finalPrice) {
      router.push('/venues');
    }
  }, [session, venue_id, finalPrice, router]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Create payment session on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue_id,
          name,
          phone,
          startDate,
          endDate,
          amount: finalPrice,
          days,
          userId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!venue_id || !finalPrice) return null;

  return (
    <Layout title="Payment">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">Complete Your Booking</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Check-in:</strong> {startDate}</p>
            <p><strong>Check-out:</strong> {endDate}</p>
            <p><strong>Duration:</strong> {days} days</p>
            <p className="text-xl font-bold mt-4">
              Total Amount: ${typeof finalPrice === 'string' ? parseFloat(finalPrice).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </Layout>
  );
};

export default PaymentPage;
