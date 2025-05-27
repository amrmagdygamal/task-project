import { create } from 'zustand';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { z } from 'zod';
import { supabase } from '../utils/supabase';

// Schema for booking validation
export const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

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
  actionLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | '' };
  setVenue: (venue: Venue | null) => void;
  setLoading: (loading: boolean) => void;
  setReviews: (reviews: Review[]) => void;
  setReviewForm: (reviewForm: { rating: number; comment: string }) => void;
  setReservations: (reservations: Reservation[]) => void;
  setBooking: (booking: { name: string; phone: string; startDate: string; endDate: string }) => void;
  setBookingErrors: (bookingErrors: { name?: string; phone?: string; startDate?: string; endDate?: string }) => void;
  setBookingSuccess: (bookingSuccess: boolean) => void;
  setActionLoading: (loading: boolean) => void;
  setToast: (toast: { message: string; type: 'success' | 'error' | '' }) => void;
  handleBooking: (e: React.FormEvent, router: any, session: any) => Promise<void>;
  handleDownloadPDF: () => Promise<void>;
  reset: () => void;
  fetchVenue: (id: string) => Promise<void>;
  fetchReservations: (id: string) => Promise<void>;
  generatePDF: (venue: Venue) => Promise<void>;
  validateBooking: () => { isValid: boolean; errors: { name?: string; phone?: string; startDate?: string; endDate?: string } };
  calculateBookingPrice: () => { days: number; finalPrice: number } | null;
}

export const useVenueDetailStore = create<VenueDetailState>((set, get) => ({
  venue: null,
  loading: true,
  reviews: [],
  reviewForm: { rating: 5, comment: '' },
  reservations: [],
  booking: { name: '', phone: '', startDate: '', endDate: '' },
  bookingErrors: {},
  bookingSuccess: false,
  actionLoading: false,
  toast: { message: '', type: '' },

  setVenue: (venue) => set({ venue }),
  setLoading: (loading) => set({ loading }),
  setReviews: (reviews) => set({ reviews }),
  setReviewForm: (reviewForm) => set({ reviewForm }),
  setReservations: (reservations) => set({ reservations }),
  setBooking: (booking) => set({ booking }),
  setBookingErrors: (bookingErrors) => set({ bookingErrors }),
  setBookingSuccess: (bookingSuccess) => set({ bookingSuccess }),
  setActionLoading: (loading) => set({ actionLoading: loading }),
  setToast: (toast) => set({ toast }),
  handleBooking: async (e: React.FormEvent, router: any, session: any) => {
    e.preventDefault();
    const { venue, booking } = get();
    if (!venue || !session) return;
    
    set({ actionLoading: true });
    
    // Validate dates
    const now = new Date();
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    
    if (start < now) {
      set({ 
        bookingErrors: { startDate: 'Start date must be in the future' },
        actionLoading: false 
      });
      return;
    }
    
    if (end <= start) {
      set({ 
        bookingErrors: { endDate: 'End date must be after start date' },
        actionLoading: false 
      });
      return;
    }
    
    const result = bookingSchema.safeParse(booking);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      set({ bookingErrors: fieldErrors, actionLoading: false });
      return;
    }
    
    set({ bookingErrors: {} });
    
    // Calculate number of days and price (rounded to next full day)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const finalPrice = days * (venue.dayprice || 0);

    try {
      // Store booking intent in URL query params
      // Actual booking will be created after successful payment
      const bookingIntent = {
        venue_id: venue.id,
        user_id: session.user.id,
        start_date: booking.startDate,
        end_date: booking.endDate,
        total_price: finalPrice,
      };

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
    } catch (error) {
      console.error('Error creating booking:', error);
      set({ 
        toast: { message: 'Failed to create booking. Please try again.', type: 'error' },
        actionLoading: false 
      });
    }
    set({ actionLoading: false });
  },

  handleDownloadPDF: async () => {
    const { venue } = get();
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
      color: rgb(0.23, 0.38, 0.85),
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
  },

  reset: () => set({
    venue: null,
    loading: true,
    reviews: [],
    reviewForm: { rating: 5, comment: '' },
    reservations: [],
    booking: { name: '', phone: '', startDate: '', endDate: '' },
    bookingErrors: {},
    bookingSuccess: false,
    actionLoading: false,
    toast: { message: '', type: '' }
  }),

  fetchVenue: async (id) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!error && data) {
      set({ venue: data });
    }
    set({ loading: false });
  },

  fetchReservations: async (id) => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('venue_id', id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      set({ reservations: data });
    }
  },

  generatePDF: async (venue) => {
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
      color: rgb(0.23, 0.38, 0.85),
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
        
        page.drawText('Venue Image:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: helveticaBold,
          color: rgb(0.3, 0.3, 0.3)
        });
        
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
  },

  validateBooking: () => {
    const { booking } = get();
    const result = bookingSchema.safeParse(booking);
    
    if (!result.success) {
      const fieldErrors: { name?: string; phone?: string; startDate?: string; endDate?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
      });
      return { isValid: false, errors: fieldErrors };
    }
    
    return { isValid: true, errors: {} };
  },

  calculateBookingPrice: () => {
    const { booking, venue } = get();
    if (!venue || !booking.startDate || !booking.endDate) return null;

    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const finalPrice = days * (venue.dayprice || 0);

    return { days, finalPrice };
  },
}));
