export interface Booking {
  id: string;
  venue_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  created_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_id?: string;
  venues?: {
    name: string;
    image_url: string | null;
  };
}
