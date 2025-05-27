import { create } from 'zustand';

// Strongly typed interfaces for venue, review, reservation
interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  image_url?: string;
  created_at: string;
  description?: string;
  dayprice?: number;
}

interface Review {
  userId: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: { full_name: string; profile: string };
}

interface Reservation {
  userId: string;
  startDate: string;
  endDate: string;
}

interface VenueDetailState {
  venue: Venue | null;
  loading: boolean;
  reviews: Review[];
  reviewForm: { rating: number; comment: string };
  reservations: Reservation[];
  booking: { name: string; phone: string; startDate: string; endDate: string };
  bookingErrors: { name?: string; phone?: string; startDate?: string; endDate?: string };
  bookingSuccess: boolean;
  setVenue: (venue: Venue | null) => void;
  setLoading: (loading: boolean) => void;
  setReviews: (reviews: Review[]) => void;
  setReviewForm: (reviewForm: { rating: number; comment: string }) => void;
  setReservations: (reservations: Reservation[]) => void;
  setBooking: (booking: { name: string; phone: string; startDate: string; endDate: string }) => void;
  setBookingErrors: (bookingErrors: { name?: string; phone?: string; startDate?: string; endDate?: string }) => void;
  setBookingSuccess: (bookingSuccess: boolean) => void;
  reset: () => void;
}

export const useVenueDetailStore = create<VenueDetailState>((set) => ({
  venue: null,
  loading: true,
  reviews: [],
  reviewForm: { rating: 5, comment: '' },
  reservations: [],
  booking: { name: '', phone: '', startDate: '', endDate: '' },
  bookingErrors: {},
  bookingSuccess: false,
  setVenue: (venue) => set({ venue }),
  setLoading: (loading) => set({ loading }),
  setReviews: (reviews) => set({ reviews }),
  setReviewForm: (reviewForm) => set({ reviewForm }),
  setReservations: (reservations) => set({ reservations }),
  setBooking: (booking) => set({ booking }),
  setBookingErrors: (bookingErrors) => set({ bookingErrors }),
  setBookingSuccess: (bookingSuccess) => set({ bookingSuccess }),
  reset: () => set({
    venue: null,
    loading: true,
    reviews: [],
    reviewForm: { rating: 5, comment: '' },
    reservations: [],
    booking: { name: '', phone: '', startDate: '', endDate: '' },
    bookingErrors: {},
    bookingSuccess: false,
  }),
}));
