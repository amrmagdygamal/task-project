import { create } from 'zustand';
import { Venue } from '../types/venues';

interface VenuesState {
  venues: Venue[];
  loading: boolean;
  setVenues: (venues: Venue[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useVenuesStore = create<VenuesState>((set) => ({
  venues: [],
  loading: true,
  setVenues: (venues) => set({ venues }),
  setLoading: (loading) => set({ loading }),
}));
