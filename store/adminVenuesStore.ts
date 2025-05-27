import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Venue } from '../types/venues';

interface AdminVenuesState {
  venues: Venue[];
  loading: boolean;
  fetched: boolean;
  setVenues: (venues: Venue[]) => void;
  setLoading: (loading: boolean) => void;
  setFetched: (fetched: boolean) => void;
  fetchVenues: (userId: string) => Promise<void>;
}

export const useAdminVenuesStore = create<AdminVenuesState>((set, get) => ({
  venues: [],
  loading: false,
  fetched: false,
  setVenues: (venues) => set({ venues, fetched: true }),
  setLoading: (loading) => set({ loading }),
  setFetched: (fetched) => set({ fetched }),
  fetchVenues: async (userId: string) => {
    const state = get();
    if (state.venues.length > 0 && state.fetched) {
      return;
    }
    
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('ownerId', userId);
        
      if (error) {
        console.error('Error fetching venues:', error);
        return;
      }

      if (data) {
        set({ venues: data, fetched: true });
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
