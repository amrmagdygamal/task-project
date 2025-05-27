import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../utils/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'process not allowed' });
  }

  try {
    const { venue_id, name, phone, startDate, endDate, amount, days, userId } = req.body;

    // fetch venue details 
    const { data: venue } = await supabase
      .from('venues')
      .select('name, dayprice')
      .eq('id', venue_id)
      .single();

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking for ${venue.name}`,
              description: `${days} days (${startDate} - ${endDate})`,
            },
            unit_amount: Math.round(Number(amount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/venues/${venue_id}?canceled=true`,
      metadata: {
        venue_id,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        name,
        phone,
        days,
      },
    });

    res.status(200).json({
      sessionId: session.id,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Payment failed' 
    });
  }
}