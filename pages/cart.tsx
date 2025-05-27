import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const CartPage = () => {
  const { session } = useAuthStore();
  const { cart, loading, stripeUrl, setCart, setLoading, setStripeUrl, reset } = useCartStore();
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

  useEffect(() => {
    // Load cart from localStorage or API
    const stored = localStorage.getItem('venue_cart');
    if (stored) setCart(JSON.parse(stored));
    return () => reset();
  }, [setCart, reset]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 2500);
  };

  const handleCheckout = async () => {
    setLoading(true);
    // Simulate Stripe checkout session creation
    // In production, call your backend API to create a Stripe session
    // Here, just simulate a redirect
    setTimeout(() => {
      setStripeUrl('https://buy.stripe.com/test_checkout_demo');
      setLoading(false);
      showToast('Redirecting to Stripe demo checkout...', 'success');
    }, 1200);
  };

  const removeFromCart = (venue_id: string) => {
    const updated = cart.filter(item => item.venue_id !== venue_id);
    setCart(updated);
    localStorage.setItem('venue_cart', JSON.stringify(updated));
    showToast('Removed from cart.', 'success');
  };

  return (
    <Layout title="My Cart">
      <div className="max-w-2xl mx-auto py-8 px-2 sm:px-0">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">My Cart</h1>
        {toast.message && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center text-gray-400">Your cart is empty.</div>
        ) : (
          <ul className="space-y-4 mb-6">
            {cart.map(item => (
              <li key={item.venue_id} className="border-2 border-indigo-100 rounded-xl p-4 flex gap-4 items-center bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-20 h-16 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-indigo-800">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.startDate} to {item.endDate}</div>
                  <div className="text-sm">Price: <span className="font-medium">${item.dayprice}</span></div>
                </div>
                <button onClick={() => removeFromCart(item.venue_id)} className="text-red-500 hover:underline" aria-label="Remove from cart">Remove</button>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 && !loading && (
          <button onClick={handleCheckout} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-all duration-150 shadow-md disabled:opacity-60 mb-4">
            {loading ? 'Redirecting to Stripe...' : 'Checkout with Stripe'}
          </button>
        )}
        {stripeUrl && (
          <div className="mt-4 text-center">
            <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Proceed to Stripe Demo Checkout</a>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
