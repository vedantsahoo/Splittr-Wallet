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

// Helper to fetch complete details of a single group
function getFullGroup(groupId: string) {
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId) as any;
  if (!group) return null;

  const members = db.prepare('SELECT * FROM group_members WHERE group_id = ?').all(groupId) as any[];
  const expenses = db.prepare('SELECT * FROM group_expenses WHERE group_id = ? ORDER BY date DESC, id DESC').all(groupId) as any[];

  // Fetch shares for each expense
  const expensesWithShares = expenses.map(exp => {
    const shares = db.prepare('SELECT * FROM group_expense_shares WHERE expense_id = ?').all(exp.id) as any[];
    return {
      id: exp.id,
      description: exp.description,
      amount: exp.amount,
      paidBy: exp.paid_by,
      paidByName: exp.paid_by_name,
      date: exp.date,
      category: exp.category,
      splitType: exp.split_type,
      shares: shares.map(s => ({
        memberId: s.member_id,
        memberName: s.member_name,
        amount: s.amount
      }))
    };
  });

  // Calculate real-time balances for each member
  const memberBalances: Record<string, { paid: number; owed: number }> = {};
  members.forEach(m => {
    memberBalances[m.member_id] = { paid: 0, owed: 0 };
  });

  expensesWithShares.forEach(exp => {
    if (memberBalances[exp.paidBy]) {
      memberBalances[exp.paidBy].paid += exp.amount;
    }
    exp.shares.forEach(share => {
      if (memberBalances[share.memberId]) {
        memberBalances[share.memberId].owed += share.amount;
      }
    });
  });

  const formattedMembers = members.map(m => ({
    id: m.member_id,
    name: m.name,
    initials: m.initials,
    balance: (memberBalances[m.member_id]?.paid || 0) - (memberBalances[m.member_id]?.owed || 0)
  }));

  return {
    id: group.id,
    name: group.name,
    icon: group.icon,
    color: group.color,
    currency: group.currency,
    members: formattedMembers,
    expenses: expensesWithShares,
    totalExpenses: group.total_expenses
  };
}

// GET /api/groups
router.get('/', requireAuth, (req, res) => {
  try {
    const groupIds = db.prepare('SELECT id FROM groups').all() as { id: string }[];
    const fullGroups = groupIds.map(g => getFullGroup(g.id)).filter(Boolean);
    res.json(fullGroups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/groups/:id
router.get('/:id', requireAuth, (req, res) => {
  try {
    const group = getFullGroup(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/groups
router.post('/', requireAuth, (req: any, res) => {
  const { name, icon, color, currency, members } = req.body;
  const groupId = Date.now().toString();

  const createTransaction = db.transaction(() => {
    db.prepare('INSERT INTO groups (id, name, icon, color, currency, total_expenses) VALUES (?, ?, ?, ?, ?, 0)')
      .run(groupId, name, icon || '👥', color || '#10B981', currency);

    const insertMember = db.prepare('INSERT INTO group_members (group_id, member_id, name, initials, balance) VALUES (?, ?, ?, ?, 0)');
    
    // Add "You" as the first member if not explicitly passed
    let hasYou = false;
    members.forEach((m: any, idx: number) => {
      const memberId = m.id || (idx + 1).toString();
      if (m.name === 'You') hasYou = true;
      const initials = m.initials || m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      insertMember.run(groupId, memberId, m.name, initials);
    });

    if (!hasYou) {
      // Use logged in user details if available
      const activeUser = db.prepare('SELECT name FROM users WHERE id = ?').get(req.userId) as any;
      const activeName = activeUser?.name || 'You';
      const initials = activeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      insertMember.run(groupId, req.userId, 'You', initials);
    }
  });

  try {
    createTransaction();
    const group = getFullGroup(groupId);
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/groups/:id/expenses
router.post('/:id/expenses', requireAuth, (req: any, res) => {
  const groupId = req.params.id;
  const { description, amount, paidBy, paidByName, date, category, splitType, shares } = req.body;
  const expenseId = `e${Date.now()}`;

  const addExpenseTx = db.transaction(() => {
    // 1. Insert expense
    db.prepare(`
      INSERT INTO group_expenses (id, group_id, description, amount, paid_by, paid_by_name, date, category, split_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(expenseId, groupId, description, amount, paidBy, paidByName, date, category, splitType || 'equal');

    // 2. Insert shares
    const insertShare = db.prepare('INSERT INTO group_expense_shares (expense_id, member_id, member_name, amount) VALUES (?, ?, ?, ?)');
    shares.forEach((share: any) => {
      insertShare.run(expenseId, share.memberId, share.memberName, share.amount);
    });

    // 3. Update total expenses of group
    db.prepare('UPDATE groups SET total_expenses = total_expenses + ? WHERE id = ?')
      .run(amount, groupId);

    // 4. Also insert a transaction for user if they were involved in paying or sharing
    const txId = Date.now().toString();
    const groupNameRow = db.prepare('SELECT name FROM groups WHERE id = ?').get(groupId) as any;
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status, group_name)
      VALUES (?, ?, 'group_expense', ?, 'INR', ?, ?, ?, 'completed', ?)
    `).run(txId, req.userId, amount, description, date, category, groupNameRow?.name || 'Group');
  });

  try {
    addExpenseTx();
    const group = getFullGroup(groupId);
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/groups/:id/expenses/:expenseId
router.delete('/:id/expenses/:expenseId', requireAuth, (req, res) => {
  const groupId = req.params.id;
  const expenseId = req.params.expenseId;

  const deleteExpenseTx = db.transaction(() => {
    const expense = db.prepare('SELECT amount FROM group_expenses WHERE id = ?').get(expenseId) as any;
    if (!expense) {
      throw new Error('Expense not found');
    }

    db.prepare('DELETE FROM group_expenses WHERE id = ?').run(expenseId);
    db.prepare('UPDATE groups SET total_expenses = MAX(0, total_expenses - ?) WHERE id = ?')
      .run(expense.amount, groupId);
  });

  try {
    deleteExpenseTx();
    const group = getFullGroup(groupId);
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
