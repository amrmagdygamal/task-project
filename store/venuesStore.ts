import { create } from 'zustand';
import { Venue } from '../types/venues';
import { supabase } from '@/utils/supabase';

interface VenuesState {
  venues: Venue[];
  loading: boolean;
  fetched: boolean;
  setVenues: (venues: Venue[]) => void;
  setLoading: (loading: boolean) => void;
  setFetched: (fetched: boolean) => void;
  fetchVenues: () => Promise<void>;
}

export const useVenuesStore = create<VenuesState>((set, get) => ({
  venues: [],
  loading: false,
  fetched: false,
  setVenues: (venues) => set({ venues, fetched: true }),
  setLoading: (loading) => set({ loading }),
  setFetched: (fetched) => set({ fetched }),
  fetchVenues: async () => {
    const state = get();
    if (state.venues.length > 0 && state.fetched) {
      return;
    }
    
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('venues').select('*');
      if (!error && data) {
        set({ venues: data, fetched: true });
      } else {
        console.error('Error fetching venues:', error);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
