import { create } from 'zustand';

interface Booking {
  id: string;
  venue_id: string;
  startDate: string;
  endDate: string;
  status: string;
  created_at: string;
  venue?: { name: string; image_url?: string };
}

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: [],
  loading: true,
  setBookings: (bookings) => set({ bookings }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ bookings: [], loading: true }),
}));
