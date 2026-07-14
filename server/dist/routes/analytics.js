import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/analytics.js';
const router = Router();
// GET /api/analytics
router.get('/', requireAuth, getAnalytics);
export default router;
