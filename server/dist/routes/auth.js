import { Router } from 'express';
import { getMe, login, register, logout, updateProfile, updateLimits, getCurrentUserId } from '../controllers/auth.js';
const router = Router();
// Re-export getCurrentUserId for backward compatibility with other routers
export { getCurrentUserId };
// GET /api/auth/me
router.get('/me', getMe);
// POST /api/auth/login
router.post('/login', login);
// POST /api/auth/register
router.post('/register', register);
// POST /api/auth/logout
router.post('/logout', logout);
// PUT /api/auth/profile
router.put('/profile', updateProfile);
// PUT /api/auth/limits
router.put('/limits', updateLimits);
export default router;
