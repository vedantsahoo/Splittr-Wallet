import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getBalances, getTransactions, addFunds, sendMoney, getSavingsGoals, createSavingsGoal, updateGoalProgress, getContacts, createContact } from '../controllers/wallet.js';
const router = Router();
// GET /api/wallet/balances
router.get('/balances', requireAuth, getBalances);
// GET /api/wallet/transactions
router.get('/transactions', requireAuth, getTransactions);
// POST /api/wallet/add-funds
router.post('/add-funds', requireAuth, addFunds);
// POST /api/wallet/send-money
router.post('/send-money', requireAuth, sendMoney);
// GET /api/wallet/savings-goals
router.get('/savings-goals', requireAuth, getSavingsGoals);
// POST /api/wallet/savings-goals
router.post('/savings-goals', requireAuth, createSavingsGoal);
// PUT /api/wallet/savings-goals/:id/progress
router.put('/savings-goals/:id/progress', requireAuth, updateGoalProgress);
// GET /api/wallet/contacts
router.get('/contacts', requireAuth, getContacts);
// POST /api/wallet/contacts
router.post('/contacts', requireAuth, createContact);
export default router;
