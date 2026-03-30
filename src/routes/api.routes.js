const express = require('express');
const router = express.Router();

// 1. Import Middlewares
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// 2. Import Schemas & Controllers
const { transactionSchema } = require('../validations/transaction.schema');
const transactionController = require('../controllers/transactions.controller');

// --- TRANSACTIONS (Requirements #2, #5) ---

// POST: Add transaction (Checks data with Joi AND identifies user with Protect)
router.post(
  '/transactions', 
  protect, 
  validate(transactionSchema), 
  transactionController.addTransaction
);

// GET: History (Requirement #2)
router.get('/transactions', protect, transactionController.getTransactions);

// DELETE: (Optional Requirement #2)
router.delete('/transactions/:id', protect, transactionController.deleteTransaction);


// --- BALANCE & CALCULATIONS (Requirements #3, #4) ---

// GET: Dashboard Stats (Safe-to-Spend, 7.5% Savings, Alerts)
router.get('/dashboard', protect, transactionController.getDashboardData);

module.exports = router;
