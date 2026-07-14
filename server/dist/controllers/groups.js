import db from '../db.js';
function requireGroupMember(groupId, userId) {
    const membership = db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND member_id = ?').get(groupId, userId);
    if (!membership) {
        throw new Error('Group not found');
    }
}
function parsePositiveAmount(value, fieldName = 'amount') {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`${fieldName} must be a positive number`);
    }
    return amount;
}
function isBalancedSplit(amount, shares) {
    const totalShares = shares.reduce((sum, share) => sum + share.amount, 0);
    return Math.abs(totalShares - amount) <= 0.01;
}
function getFullGroup(groupId) {
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group)
        return null;
    const members = db.prepare('SELECT * FROM group_members WHERE group_id = ?').all(groupId);
    const expenses = db.prepare('SELECT * FROM group_expenses WHERE group_id = ? ORDER BY date DESC, id DESC').all(groupId);
    const expensesWithShares = expenses.map(exp => {
        const shares = db.prepare('SELECT * FROM group_expense_shares WHERE expense_id = ?').all(exp.id);
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
    const memberBalances = {};
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
export const getGroups = (req, res) => {
    try {
        const groupIds = db.prepare(`
      SELECT g.id 
      FROM groups g 
      JOIN group_members gm ON g.id = gm.group_id 
      WHERE gm.member_id = ?
    `).all(req.userId);
        const fullGroups = groupIds.map(g => getFullGroup(g.id)).filter(Boolean);
        res.json(fullGroups);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// GET /api/groups/:id
export const getGroupById = (req, res) => {
    try {
        requireGroupMember(req.params.id, req.userId);
        const group = getFullGroup(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json(group);
    }
    catch (error) {
        res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
    }
};
// POST /api/groups
export const createGroup = (req, res) => {
    const { name, icon, color, currency, members } = req.body;
    const groupId = Date.now().toString();
    const createTransaction = db.transaction(() => {
        if (!String(name || '').trim()) {
            throw new Error('Group name is required');
        }
        db.prepare('INSERT INTO groups (id, name, icon, color, currency, total_expenses) VALUES (?, ?, ?, ?, ?, 0)')
            .run(groupId, name, icon || '👥', color || '#10B981', currency);
        const insertMember = db.prepare('INSERT INTO group_members (group_id, member_id, name, initials, balance) VALUES (?, ?, ?, ?, 0)');
        const activeUser = db.prepare('SELECT name FROM users WHERE id = ?').get(req.userId);
        const activeName = activeUser?.name || 'You';
        const activeInitials = activeName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
        insertMember.run(groupId, req.userId, 'You', activeInitials);
        if (Array.isArray(members)) {
            members.forEach((m, idx) => {
                if (!m?.name || m.id === req.userId || m.name === 'You')
                    return;
                const memberId = m.id || `new-${Date.now()}-${idx}`;
                const initials = m.initials || m.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                insertMember.run(groupId, memberId, String(m.name).trim(), initials);
            });
        }
    });
    try {
        createTransaction();
        const group = getFullGroup(groupId);
        res.json(group);
    }
    catch (error) {
        res.status(error.message.includes('required') ? 400 : 500).json({ error: error.message });
    }
};
// POST /api/groups/:id/expenses
export const addExpense = (req, res) => {
    const groupId = req.params.id;
    const { description, amount, paidBy, paidByName, date, category, splitType, shares } = req.body;
    const expenseId = `e${Date.now()}`;
    const addExpenseTx = db.transaction(() => {
        requireGroupMember(groupId, req.userId);
        const parsedAmount = parsePositiveAmount(amount);
        const cleanDescription = String(description || '').trim();
        if (!cleanDescription) {
            throw new Error('Description is required');
        }
        if (!Array.isArray(shares) || shares.length === 0) {
            throw new Error('At least one expense share is required');
        }
        const members = db.prepare('SELECT member_id, name FROM group_members WHERE group_id = ?').all(groupId);
        const memberIds = new Set(members.map(member => member.member_id));
        if (!memberIds.has(paidBy)) {
            throw new Error('Payer is not a group member');
        }
        const normalizedShares = shares.map((share) => {
            const shareAmount = parsePositiveAmount(share.amount, 'share amount');
            if (!memberIds.has(share.memberId)) {
                throw new Error('Expense share includes a non-member');
            }
            return {
                memberId: share.memberId,
                memberName: share.memberName || members.find(member => member.member_id === share.memberId)?.name || 'Member',
                amount: shareAmount,
            };
        });
        if (!isBalancedSplit(parsedAmount, normalizedShares)) {
            throw new Error('Expense shares must equal the total amount');
        }
        // 1. Insert expense
        db.prepare(`
      INSERT INTO group_expenses (id, group_id, description, amount, paid_by, paid_by_name, date, category, split_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(expenseId, groupId, cleanDescription, parsedAmount, paidBy, paidByName, date, category, splitType || 'equal');
        // 2. Insert shares
        const insertShare = db.prepare('INSERT INTO group_expense_shares (expense_id, member_id, member_name, amount) VALUES (?, ?, ?, ?)');
        normalizedShares.forEach((share) => {
            insertShare.run(expenseId, share.memberId, share.memberName, share.amount);
        });
        // 3. Update total expenses of group
        db.prepare('UPDATE groups SET total_expenses = total_expenses + ? WHERE id = ?')
            .run(parsedAmount, groupId);
        // 4. Also insert a transaction for user if they were involved in paying or sharing
        const txId = Date.now().toString();
        const groupNameRow = db.prepare('SELECT name FROM groups WHERE id = ?').get(groupId);
        db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status, group_name)
      VALUES (?, ?, 'group_expense', ?, 'INR', ?, ?, ?, 'completed', ?)
    `).run(txId, req.userId, parsedAmount, cleanDescription, date, category, groupNameRow?.name || 'Group');
    });
    try {
        addExpenseTx();
        const group = getFullGroup(groupId);
        res.json(group);
    }
    catch (error) {
        const isClientError = [
            'not found',
            'must be',
            'required',
            'member',
            'shares',
            'Payer',
        ].some((message) => error.message.includes(message));
        res.status(isClientError ? 400 : 500).json({ error: error.message });
    }
};
// DELETE /api/groups/:id/expenses/:expenseId
export const deleteExpense = (req, res) => {
    const groupId = req.params.id;
    const expenseId = req.params.expenseId;
    const deleteExpenseTx = db.transaction(() => {
        requireGroupMember(groupId, req.userId);
        const expense = db.prepare('SELECT amount FROM group_expenses WHERE id = ? AND group_id = ?').get(expenseId, groupId);
        if (!expense) {
            throw new Error('Expense not found');
        }
        db.prepare('DELETE FROM group_expenses WHERE id = ? AND group_id = ?').run(expenseId, groupId);
        db.prepare('UPDATE groups SET total_expenses = MAX(0, total_expenses - ?) WHERE id = ?')
            .run(expense.amount, groupId);
    });
    try {
        deleteExpenseTx();
        const group = getFullGroup(groupId);
        res.json(group);
    }
    catch (error) {
        res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
    }
};
// DELETE /api/groups/:id
export const deleteGroup = (req, res) => {
    const groupId = req.params.id;
    try {
        requireGroupMember(groupId, req.userId);
        db.prepare('DELETE FROM groups WHERE id = ?').run(groupId);
        res.json({ success: true });
    }
    catch (error) {
        res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
    }
};
