// This simulates sending an email notification.
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { to, subject, text } = req.body;
  // console.log('Simulated email:', { to, subject, text });
  res.status(200).json({ success: true });
}
