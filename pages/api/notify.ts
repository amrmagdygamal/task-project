// Simulate sending an email notification (for demo purposes)
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { to, subject, text } = req.body;
  // In a real app, integrate with Mailgun, SendGrid, etc.
  // For demo, just log and return success
  console.log('Simulated email:', { to, subject, text });
  res.status(200).json({ success: true });
}
