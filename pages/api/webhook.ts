import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '../../utils/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret!);
  } catch (err) {
    console.error('Webhook error:', err);
    return res
      .status(400)
      .send(
        `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
  }

  // Handle the event
  // console.log('Received event:', event.type);
  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata!;

      // Create the booking in the database
      const { error: bookingError } = await supabase.from('bookings').insert([
        {
          venue_id: metadata.venue_id,
          user_id: metadata.user_id,
          start_date: metadata.start_date,
          end_date: metadata.end_date,
          total_price: session.amount_total ? session.amount_total / 100 : 0,
          payment_id: session.payment_intent as string,
          status: 'confirmed',
        },
      ]);
      if (bookingError) {
        console.error('Booking error:', bookingError);
        return res.status(500).json({ error: 'Failed to create booking' });
      }
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(200).json({ received: true });
}
