import { useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useVenuesStore } from '../store/venuesStore';
import Link from 'next/link';
import Image from 'next/image';

const IndexPage = () => {
  const { venues, loading, setVenues, setLoading } = useVenuesStore();

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('venues').select('*');
      if (!error && data) setVenues(data);
      setLoading(false);
    };
    fetchVenues();
  }, [setVenues, setLoading]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">Welcome to Booking Platform</h1>
          <p className="text-lg text-gray-600">Find and book the perfect venue for your next event</p>
        </header>

        {loading ? (
          <div className="fl-ro-ce-ce py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No venues available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  {venue.image_url && (
                                    <Image 
                                      src={venue.image_url} 
                                      alt={venue.name} 
                                      fill 
                                      className="object-cover rounded-lg"
                                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{venue.name}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{venue.description}</p>
                  <div className="fl-ro-ce-be">
                    <div className="text-indigo-600 font-semibold">${venue.dayprice}/day</div>
                    <Link
                      href={`/venues/${venue.id}`}
                      className="inline-fl-ro-ce-stpx-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </Link>
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

export default IndexPage;
