import { Router } from 'express';
import db from '../db.js';
import { getCurrentUserId } from './auth.js';

const router = Router();

// Middleware to require auth
function requireAuth(req: any, res: any, next: any) {
  const userId = getCurrentUserId();
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
}

// GET /api/wallet/balances
router.get('/balances', requireAuth, (req: any, res) => {
  try {
    const balances = db.prepare('SELECT * FROM wallet_balances WHERE user_id = ?').all(req.userId);
    res.json(balances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', requireAuth, (req: any, res) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC').all(req.userId) as any[];
    // Convert DB fields back to camelCase frontend format
    const formatted = transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      description: t.description,
      date: t.date,
      category: t.category,
      status: t.status,
      senderName: t.sender_name,
      recipientName: t.recipient_name,
      userAvatar: t.user_avatar,
      groupName: t.group_name
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/wallet/add-funds
router.post('/add-funds', requireAuth, (req: any, res) => {
  const { amount, currency } = req.body;
  const userId = req.userId;
  
  const updateBalance = db.transaction(() => {
    // 1. Update wallet balance
    const current = db.prepare('SELECT amount FROM wallet_balances WHERE user_id = ? AND currency = ?').get(userId, currency) as any;
    if (!current) {
      throw new Error(`Currency ${currency} not supported`);
    }
    const newAmount = current.amount + amount;
    db.prepare('UPDATE wallet_balances SET amount = ? WHERE user_id = ? AND currency = ?').run(newAmount, userId, currency);

    // 2. Insert transaction record
    const id = Date.now().toString();
    const date = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status)
      VALUES (?, ?, 'wallet_funding', ?, ?, 'Added via UPI', ?, 'Wallet', 'completed')
    `).run(id, userId, amount, currency, date);

    return { newAmount };
  });

  try {
    const result = updateBalance();
    res.json({ success: true, newAmount: result.newAmount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/wallet/send-money
router.post('/send-money', requireAuth, (req: any, res) => {
  const { amount, currency, recipient } = req.body;
  const userId = req.userId;

  const performSend = db.transaction(() => {
    // 1. Deduct wallet balance
    const current = db.prepare('SELECT amount FROM wallet_balances WHERE user_id = ? AND currency = ?').get(userId, currency) as any;
    if (!current) {
      throw new Error(`Currency ${currency} not supported`);
    }
    if (current.amount < amount) {
      throw new Error('Insufficient balance');
    }
    const newAmount = current.amount - amount;
    db.prepare('UPDATE wallet_balances SET amount = ? WHERE user_id = ? AND currency = ?').run(newAmount, userId, currency);

    // 2. Insert transaction
    const id = Date.now().toString();
    const date = new Date().toISOString().split('T')[0];
    const initials = recipient.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status, recipient_name, user_avatar)
      VALUES (?, ?, 'sent', ?, ?, ?, ?, 'Transfer', 'completed', ?, ?)
    `).run(id, userId, amount, currency, `To ${recipient}`, date, recipient, initials);

    return { newAmount };
  });

  try {
    const result = performSend();
    res.json({ success: true, newAmount: result.newAmount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wallet/savings-goals
router.get('/savings-goals', requireAuth, (req: any, res) => {
  try {
    const goals = db.prepare('SELECT * FROM savings_goals WHERE user_id = ?').all(req.userId);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/wallet/savings-goals
router.post('/savings-goals', requireAuth, (req: any, res) => {
  try {
    const { name, target, current, currency, color, deadline } = req.body;
    const id = Date.now().toString();
    db.prepare(`
      INSERT INTO savings_goals (id, user_id, name, target, current, currency, color, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId, name, target, current || 0, currency, color || '#10B981', deadline || null);

    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id);
    res.json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/wallet/savings-goals/:id/progress
router.put('/savings-goals/:id/progress', requireAuth, (req: any, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.userId;

  const updateGoal = db.transaction(() => {
    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!goal) {
      throw new Error('Goal not found');
    }

    const newCurrent = Math.min(goal.current + amount, goal.target);
    db.prepare('UPDATE savings_goals SET current = ? WHERE id = ?').run(newCurrent, id);

    // Deduct from wallet balance of the goal's currency
    const currentBal = db.prepare('SELECT amount FROM wallet_balances WHERE user_id = ? AND currency = ?').get(userId, goal.currency) as any;
    if (currentBal) {
      db.prepare('UPDATE wallet_balances SET amount = ? WHERE user_id = ? AND currency = ?')
        .run(Math.max(0, currentBal.amount - amount), userId, goal.currency);
    }

    // Add a withdrawal or saving transaction
    const txId = Date.now().toString();
    const date = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status)
      VALUES (?, ?, 'withdrawal', ?, ?, ?, ?, 'Savings', 'completed')
    `).run(txId, userId, amount, goal.currency, `Saved for ${goal.name}`, date);

    return { ...goal, current: newCurrent };
  });

  try {
    const result = updateGoal();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
