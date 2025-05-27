import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '../../utils/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
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
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata!;

    try {
      // Create the reservation in the database
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([
          {
            venue_id: metadata.venue_id,
            userId: metadata.user_id,
            startDate: metadata.start_date,
            endDate: metadata.end_date,
            name: metadata.name,
            phone: metadata.phone,
            status: 'confirmed',
            payment_id: session.payment_intent as string,
            amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            days: parseInt(metadata.days),
          },
        ]);

      if (reservationError) {
        console.error('Reservation error:', reservationError);
        return res.status(500).json({ error: 'Failed to create reservation' });
      }
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(200).json({ received: true });
}
