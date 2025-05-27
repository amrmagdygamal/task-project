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
  status: 'pending' | 'confirmed' | 'cancelled';
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

// --- UI/UX improvement suggestions for consuming pages/components ---
// 1. Use more whitespace and padding for clarity.
// 2. Use Tailwind's focus-visible and ring utilities for accessibility.
// 3. Add subtle hover/active states to interactive elements.
// 4. Use consistent rounded corners and shadow for cards and forms.
// 5. Use color for section headers and call-to-action buttons.
// 6. Add loading skeletons or spinners for async data.
// 7. Use responsive grid layouts for lists and cards.
// 8. Add aria-labels and roles to important interactive elements for accessibility.
// 9. Use transition-all and duration utilities for smooth UI feedback.
// 10. Consider using toast notifications for success/error instead of alert().
// 11. Use visually distinct error/success states for form feedback.
// 12. Add mobile-friendly touch targets and spacing.
// 13. Use font-semibold/bold for important labels and actions.
// 14. Add smooth scroll or focus to error fields on validation failure.
// 15. Use placeholder and helper text for form fields.
// 16. Add animated transitions for modal/dialog open/close.
// 17. Use icons for actions (edit, delete, download, etc.) for clarity.
// 18. Provide visual feedback for async actions (button loading spinners, etc.).
// 19. Use a11y best practices: aria-live for dynamic content, roles for lists, etc.
// 20. Test with keyboard navigation and screen readers for accessibility.
