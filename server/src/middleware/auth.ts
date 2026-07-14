import { getCurrentUserId } from '../controllers/auth.js';

export function requireAuth(req: any, res: any, next: any) {
  const userId = getCurrentUserId();
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
}
