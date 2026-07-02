import { Router } from 'express';
import db from '../db.js';

const router = Router();

// In-memory active user session tracker (defaults to '1' for initial state)
let currentUserId: string | null = '1';

export function getCurrentUserId(): string | null {
  return currentUserId;
}

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    if (!currentUserId) {
      return res.json({ isAuthenticated: false, user: null });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId) as any;
    if (!user) {
      currentUserId = null;
      return res.json({ isAuthenticated: false, user: null });
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
        walletId: user.wallet_id,
      },
      dailyLimit: user.daily_limit,
      monthlyLimit: user.monthly_limit,
      isAuthenticated: true
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Look up user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Match password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set session active user
    currentUserId = user.id;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
        walletId: user.wallet_id,
      },
      dailyLimit: user.daily_limit,
      monthlyLimit: user.monthly_limit,
      isAuthenticated: true
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  currentUserId = null;
  res.json({ success: true });
});

// PUT /api/auth/profile
router.put('/profile', (req, res) => {
  try {
    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email, phone, avatar } = req.body;
    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), 
          email = COALESCE(?, email), 
          phone = COALESCE(?, phone), 
          avatar = COALESCE(?, avatar) 
      WHERE id = ?
    `).run(name || null, email || null, phone || null, avatar || null, currentUserId);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId) as any;
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      email: updatedUser.email,
      phone: updatedUser.phone,
      walletId: updatedUser.wallet_id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/limits
router.put('/limits', (req, res) => {
  try {
    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dailyLimit, monthlyLimit } = req.body;
    db.prepare('UPDATE users SET daily_limit = ?, monthly_limit = ? WHERE id = ?')
      .run(dailyLimit, monthlyLimit, currentUserId);
    
    res.json({ dailyLimit, monthlyLimit });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
