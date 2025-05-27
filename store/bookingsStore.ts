import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Booking } from '../types/bookings';

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  fetched: boolean;
  fetchBookings: (userId: string, isAdmin?: boolean) => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<{ success: boolean; error?: string }>;
  setFetched: (value: boolean) => void;
}

export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: [],
  loading: false,
  fetched: false,

  fetchBookings: async (userId: string, isAdmin = false) => {
    try {
      set({ loading: true });
      
      let query = supabase.from('bookings').select(`
        *,
        venues (
          name,
          image_url
        )
      `);

      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        bookings: data || [], 
        loading: false,
        fetched: true 
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      set({ loading: false });
    }
  },

  createBooking: async (bookingData) => {
    try {
      set({ loading: true });
      const { error } = await supabase.from('bookings').insert(bookingData);
      set({ loading: false });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error creating booking:', error);
      set({ loading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating the booking' 
      };
    }
  },

  setFetched: (value) => set({ fetched: value })
}));
