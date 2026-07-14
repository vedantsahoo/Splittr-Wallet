import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getGroups,
  getGroupById,
  createGroup,
  addExpense,
  deleteExpense,
  deleteGroup
} from '../controllers/groups.js';

const router = Router();

// GET /api/groups
router.get('/', requireAuth, getGroups);

// GET /api/groups/:id
router.get('/:id', requireAuth, getGroupById);

// POST /api/groups
router.post('/', requireAuth, createGroup);

// POST /api/groups/:id/expenses
router.post('/:id/expenses', requireAuth, addExpense);

// DELETE /api/groups/:id/expenses/:expenseId
router.delete('/:id/expenses/:expenseId', requireAuth, deleteExpense);

// DELETE /api/groups/:id
router.delete('/:id', requireAuth, deleteGroup);

export default router;
