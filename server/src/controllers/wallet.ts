import db from '../db.js';

function parsePositiveAmount(value: unknown, fieldName = 'amount') {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return amount;
}

function checkLimits(userId: string, amount: number, date: string, currency: string) {
  let amountInINR = amount;
  if (currency === 'USD') {
    amountInINR = amount * 83;
  } else if (currency === 'EUR') {
    amountInINR = amount * 90;
  }

  const user = db.prepare('SELECT daily_limit, monthly_limit FROM users WHERE id = ?').get(userId) as any;
  if (!user) return;

  const dailyLimit = user.daily_limit;
  const monthlyLimit = user.monthly_limit;

  const dailyTransactions = db.prepare(`
    SELECT amount, currency 
    FROM transactions 
    WHERE user_id = ? 
      AND type IN ('sent', 'withdrawal', 'group_expense', 'group_settlement') 
      AND date = ?
  `).all(userId, date) as { amount: number; currency: string }[];

  let dailySpent = 0;
  dailyTransactions.forEach(tx => {
    let txAmt = tx.amount;
    if (tx.currency === 'USD') txAmt *= 83;
    else if (tx.currency === 'EUR') txAmt *= 90;
    dailySpent += txAmt;
  });

  if (dailySpent + amountInINR > dailyLimit) {
    throw new Error(`Transaction exceeds your daily transfer limit of ₹${dailyLimit.toLocaleString('en-IN')}. Remaining: ₹${Math.max(0, dailyLimit - dailySpent).toLocaleString('en-IN')}`);
  }

  const monthPattern = date.slice(0, 7) + '%';
  const monthlyTransactions = db.prepare(`
    SELECT amount, currency 
    FROM transactions 
    WHERE user_id = ? 
      AND type IN ('sent', 'withdrawal', 'group_expense', 'group_settlement') 
      AND date LIKE ?
  `).all(userId, monthPattern) as { amount: number; currency: string }[];

  let monthlySpent = 0;
  monthlyTransactions.forEach(tx => {
    let txAmt = tx.amount;
    if (tx.currency === 'USD') txAmt *= 83;
    else if (tx.currency === 'EUR') txAmt *= 90;
    monthlySpent += txAmt;
  });

  if (monthlySpent + amountInINR > monthlyLimit) {
    throw new Error(`Transaction exceeds your monthly transfer limit of ₹${monthlyLimit.toLocaleString('en-IN')}. Remaining: ₹${Math.max(0, monthlyLimit - monthlySpent).toLocaleString('en-IN')}`);
  }
}

// GET /api/wallet/balances
export const getBalances = (req: any, res: any) => {
  try {
    const balances = db.prepare('SELECT * FROM wallet_balances WHERE user_id = ?').all(req.userId);
    res.json(balances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/wallet/transactions
export const getTransactions = (req: any, res: any) => {
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
};

// POST /api/wallet/add-funds
export const addFunds = (req: any, res: any) => {
  const { currency } = req.body;
  const userId = req.userId;
  
  const updateBalance = db.transaction(() => {
    const amount = parsePositiveAmount(req.body.amount);

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
    res.status(error.message.includes('must be') || error.message.includes('not supported') ? 400 : 500).json({ error: error.message });
  }
};

// POST /api/wallet/send-money
export const sendMoney = (req: any, res: any) => {
  const { currency, recipientPhone, recipientName } = req.body;
  const userId = req.userId;

  const performSend = db.transaction(() => {
    const amount = parsePositiveAmount(req.body.amount);
    const txDate = new Date().toISOString().split('T')[0];

    // Enforce daily/monthly limits
    checkLimits(userId, amount, txDate, currency);

    const cleanRecipientName = String(recipientName || '').trim();
    if (!cleanRecipientName) {
      throw new Error('Recipient name is required');
    }

    // 1. Get sender details
    const sender = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as any;
    if (!sender) {
      throw new Error('Sender user not found');
    }

    // 2. Deduct sender's wallet balance
    const currentSenderBal = db.prepare('SELECT amount FROM wallet_balances WHERE user_id = ? AND currency = ?').get(userId, currency) as any;
    if (!currentSenderBal) {
      throw new Error(`Currency ${currency} not supported`);
    }
    if (currentSenderBal.amount < amount) {
      throw new Error('Insufficient balance');
    }
    const newSenderAmount = currentSenderBal.amount - amount;
    db.prepare('UPDATE wallet_balances SET amount = ? WHERE user_id = ? AND currency = ?').run(newSenderAmount, userId, currency);

    // 3. Find receiver by matching phone number
    const normalizePhone = (p: string) => p.replace(/[\s\-\(\)\+]/g, '');
    const cleanRecipientPhone = normalizePhone(recipientPhone || '');
    
    let receiver = null;
    if (cleanRecipientPhone) {
      const allUsers = db.prepare('SELECT * FROM users').all() as any[];
      for (const u of allUsers) {
        if (u.phone && normalizePhone(u.phone) === cleanRecipientPhone && u.id !== userId) {
          receiver = u;
          break;
        }
      }
    }

    const senderInitials = sender.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const recipientInitials = cleanRecipientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    if (receiver) {
      // 4. Update receiver's wallet balance
      const currentReceiverBal = db.prepare('SELECT amount FROM wallet_balances WHERE user_id = ? AND currency = ?').get(receiver.id, currency) as any;
      if (currentReceiverBal) {
        db.prepare('UPDATE wallet_balances SET amount = ? WHERE user_id = ? AND currency = ?')
          .run(currentReceiverBal.amount + amount, receiver.id, currency);
      } else {
        const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';
        const flag = currency === 'INR' ? '🇮🇳' : currency === 'USD' ? '🇺🇸' : '🇪🇺';
        db.prepare('INSERT INTO wallet_balances (user_id, currency, symbol, amount, flag) VALUES (?, ?, ?, ?, ?)')
          .run(receiver.id, currency, symbol, amount, flag);
      }

      // 5. Insert 'received' transaction log for receiver
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status, sender_name, user_avatar)
        VALUES (?, ?, 'received', ?, ?, ?, ?, 'Transfer', 'completed', ?, ?)
      `).run(
        `${Date.now()}-rec`,
        receiver.id,
        amount,
        currency,
        `Received from ${sender.name}`,
        txDate,
        sender.name,
        senderInitials
      );
    }

    // 6. Insert 'sent' transaction log for sender
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status, recipient_name, user_avatar)
      VALUES (?, ?, 'sent', ?, ?, ?, ?, 'Transfer', 'completed', ?, ?)
    `).run(
      Date.now().toString(),
      userId,
      amount,
      currency,
      `To ${cleanRecipientName}`,
      txDate,
      cleanRecipientName,
      recipientInitials
    );

    return { newAmount: newSenderAmount };
  });

  try {
    const result = performSend();
    res.json({ success: true, newAmount: result.newAmount });
  } catch (error: any) {
    const isClientError = [
      'must be',
      'required',
      'not supported',
      'Insufficient balance',
      'exceeds',
    ].some((message) => error.message.includes(message));
    res.status(isClientError ? 400 : 500).json({ error: error.message });
  }
};

// GET /api/wallet/savings-goals
export const getSavingsGoals = (req: any, res: any) => {
  try {
    const goals = db.prepare('SELECT * FROM savings_goals WHERE user_id = ?').all(req.userId);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/wallet/savings-goals
export const createSavingsGoal = (req: any, res: any) => {
  try {
    const { name, target, current, currency, color, deadline } = req.body;
    const parsedTarget = parsePositiveAmount(target, 'target');
    const parsedCurrent = current === undefined ? 0 : Number(current);
    if (!Number.isFinite(parsedCurrent) || parsedCurrent < 0) {
      return res.status(400).json({ error: 'current must be a non-negative number' });
    }
    const id = Date.now().toString();
    db.prepare(`
      INSERT INTO savings_goals (id, user_id, name, target, current, currency, color, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId, name, parsedTarget, parsedCurrent, currency, color || '#10B981', deadline || null);

    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id);
    res.json(goal);
  } catch (error: any) {
    res.status(error.message.includes('must be') ? 400 : 500).json({ error: error.message });
  }
};

// PUT /api/wallet/savings-goals/:id/progress
export const updateGoalProgress = (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.userId;

  const updateGoal = db.transaction(() => {
    const amount = parsePositiveAmount(req.body.amount);
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
    res.status(error.message.includes('must be') || error.message.includes('not found') ? 400 : 500).json({ error: error.message });
  }
};

// GET /api/wallet/contacts
export const getContacts = (req: any, res: any) => {
  try {
    const contacts = db.prepare('SELECT * FROM contacts WHERE user_id = ?').all(req.userId);
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/wallet/contacts
export const createContact = (req: any, res: any) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const id = `c${Date.now()}`;
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    
    const colors = ['#10B981', '#9966FF', '#F59E0B', '#EF4444', '#0D9488', '#EC4899', '#3B82F6', '#14B8A6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    db.prepare('INSERT INTO contacts (id, user_id, name, phone, initials, color) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, req.userId, name, phone, initials, color);

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    res.json(contact);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
