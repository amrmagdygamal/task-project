import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';
import { useAdminVenuesStore } from '../store/adminVenuesStore';
import { useBookingsStore } from '../store/bookingsStore';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Venue, Booking, VenueFormData } from '../types/venues';

const Dashboard = () => {
  const { session, role } = useAuthStore();
  const { venues, loading, fetchVenues } = useAdminVenuesStore();
  const { bookings, fetchBookings } = useBookingsStore();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [form, setForm] = useState<VenueFormData>({
    name: '',
    address: '',
    capacity: '',
    description: '',
    dayprice: '',
    image_url: '',
    available: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showBookings, setShowBookings] = useState<string | null>(null);
  const [bookingsState, setBookings] = useState<Booking[]>([]);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | '';
  }>({ message: '', type: '' });
  useEffect(() => {
    // Only redirect if we have a session but user is not an admin
    if (session && role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch venues and bookings if we have a session and user is an admin
    if (session?.user?.id && role === 'admin') {
      fetchVenues(session.user.id);
      fetchBookings(session.user.id, true);
    }
  }, [session, role, router, fetchVenues, fetchBookings]);

  const fetchBookingsFunc = useCallback(async (venueId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });
    if (!error && data) setBookings(data);
  }, []);

  const handleOpenModal = useCallback((venue?: Venue) => {
    if (venue) {
      setEditVenue(venue);
      setForm({
        name: venue.name,
        address: venue.address,
        capacity: venue.capacity.toString(),
        description: venue.description,
        dayprice: venue.dayprice.toString(),
        image_url: venue.image_url || '',
        available: venue.available,
      });
    } else {
      setEditVenue(null);
      setForm({
        name: '',
        address: '',
        capacity: '',
        description: '',
        dayprice: '',
        image_url: '',
        available: true,
      });
    }
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditVenue(null);
    setForm({
      name: '',
      address: '',
      capacity: '',
      description: '',
      dayprice: '',
      image_url: '',
      available: true,
    });
    setImageFile(null);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [e.target.name]: value }));
    },
    []
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setImageFile(e.target.files[0]);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session?.user?.id) return;

      try {
        let image_url = form.image_url;
        if (imageFile) {
          try {
            // Upload the file first
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

            const { data, error: uploadError } = await supabase.storage
              .from('venue-images')
              .upload(fileName, imageFile, {
                upsert: true,
                cacheControl: '3600',
              });

            if (uploadError) throw uploadError;

            if (data) {
              const { data: urlData } = supabase.storage
                .from('venue-images')
                .getPublicUrl(data.path);

              image_url = urlData.publicUrl;
            }
          } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload image. Please try again.');
          }
        }
        const venueData = {
          name: form.name,
          address: form.address,
          capacity: parseInt(form.capacity),
          description: form.description,
          dayprice: parseFloat(form.dayprice),
          image_url,
          available: form.available,
          ownerId: session.user.id,
        };

        if (editVenue) {
          const { error: updateError } = await supabase
            .from('venues')
            .update(venueData)
            .eq('id', editVenue.id)
            .eq('ownerId', session.user.id);

          if (updateError) throw updateError;
          setToast({ message: 'Venue updated!', type: 'success' });
        } else {
          const { error: insertError } = await supabase
            .from('venues')
            .insert([venueData]);

          if (insertError) throw insertError;
          setToast({ message: 'Venue created!', type: 'success' });
        }
        handleCloseModal();
        fetchVenues(session.user.id);
      } catch (error) {
        if (error instanceof Error) {
          setToast({ message: error.message, type: 'error' });
        } else {
          setToast({ message: 'An error occurred', type: 'error' });
        }
      }
    },
    [
      session?.user?.id,
      form,
      imageFile,
      editVenue,
      handleCloseModal,
      fetchVenues,
    ]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!session?.user?.id) return;

      try {
        const { error } = await supabase
          .from('venues')
          .delete()
          .eq('id', id)
          .eq('ownerId', session.user.id);
        if (error) throw error;
        setToast({ message: 'Venue deleted.', type: 'success' });
        fetchVenues(session.user.id);
      } catch (error) {
        if (error instanceof Error) {
          setToast({ message: error.message, type: 'error' });
        } else {
          setToast({ message: 'Failed to delete venue', type: 'error' });
        }
      }
    },
    [session?.user?.id, fetchVenues]
  );

  // Toast auto-hide
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: '' }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);
  return (
    <Layout title="Admin Dashboard">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header with add venue button */}
        <div className="fl-ro-ce-be mb-8">
          <h1 className="text-2xl font-bold text-white">Your Venues</h1>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Add New Venue
          </button>
        </div>
        {/* Toast notification */}
        {toast.message && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-500 ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {toast.message}
          </div>
        )}
        {/* Venues grid */}
        {loading ? (
          <div className="fl-ro-ce-ce h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No venues yet
            </h3>

            <p className="text-gray-500">Start by adding your first venue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  {venue.image_url ? (
                    <Image
                      src={venue.image_url}
                      alt={venue.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 fl-ro-ce-ce">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="fl-ro-st-be mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {venue.name}
                    </h3>

                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        venue.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {venue.available ? 'Available' : 'Not Available'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{venue.address}</p>

                  <div className="fl-ro-ce-be text-sm text-gray-500 mb-4">
                    <span>Capacity: {venue.capacity}</span>

                    <span>${venue.dayprice}/day</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowBookings(venue.id)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                    >
                      Bookings
                    </button>

                    <button
                      onClick={() => handleOpenModal(venue)}
                      className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors duration-200"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm('Are you sure you want to delete this venue?')
                        ) {
                          handleDelete(venue.id);
                        }
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Bookings section */}
                <div className="p-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Recent Bookings
                  </h4>

                  {bookings
                    .filter((booking) => booking.venue_id === venue.id)
                    .slice(0, 3)
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-50 p-3 rounded-lg mb-2 text-sm"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">
                            {new Date(booking.start_date).toLocaleDateString()}{' '}
                            -{new Date(booking.end_date).toLocaleDateString()}
                          </span>

                          <span className="font-medium text-indigo-600">
                            ${booking.total_price}
                          </span>
                        </div>
                      </div>
                    ))}
                  {bookings.filter((booking) => booking.venue_id === venue.id)
                    .length === 0 && (
                    <p className="text-sm text-gray-500">No bookings yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Add/Edit Venue Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fl-ro-ce-ce min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full fixed"
                style={{
                  left: '50%',
                  zIndex: '60',
                  transform: 'translateX(-50%)',
                }}
              >
                <form onSubmit={handleSubmit} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editVenue ? 'Edit Venue' : 'Add New Venue'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>

                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Capacity
                        </label>

                        <input
                          type="number"
                          name="capacity"
                          value={form.capacity}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price per Day
                        </label>

                        <input
                          type="number"
                          name="dayprice"
                          value={form.dayprice}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>

                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Image
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="available"
                        checked={form.available}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />

                      <label className="ml-2 block text-sm text-gray-900">
                        Available for booking
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {editVenue ? 'Update Venue' : 'Create Venue'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}{' '}
        {/* Bookings Modal */}
        {showBookings && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fl-ro-ce-ce min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="p-6">
                  <div className="fl-ro-ce-be mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Bookings
                    </h3>

                    <button
                      onClick={() => setShowBookings(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close</span>

                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {bookings.filter((b) => b.venue_id === showBookings)
                    .length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No bookings yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {bookings
                        .filter((b) => b.venue_id === showBookings)
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="fl-ro-st-be">
                              <div className="text-sm text-gray-500">
                                <p>
                                  From:{' '}
                                  {new Date(
                                    booking.start_date
                                  ).toLocaleDateString()}
                                </p>

                                <p>
                                  To:{' '}
                                  {new Date(
                                    booking.end_date
                                  ).toLocaleDateString()}
                                </p>

                                <p className="font-medium mt-1">
                                  Total: ${booking.total_price}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
