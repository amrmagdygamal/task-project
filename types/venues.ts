export interface VenueImage {
  url: string;
  alt: string;
}


export interface VenueReservation {
  userId: string;
  startDate: string;
  endDate: string;
  created_at: string;
}

export interface Venue {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  capacity: number;
  description: string;
  image_url?: string;
  available: boolean;
  dayprice: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  venue_id: string;
  user_id: string;
  name: string;
  phone: string;
  startDate: string;
  endDate: string;
  created_at: string;
}

export interface VenueFormData {
  name: string;
  address: string;
  capacity: string;
  description: string;
  dayprice: string;
  image_url: string;
  available: boolean;
}
