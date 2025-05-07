
const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  getBalances,
  getSettlements
} = require('../controllers/expenses');
const { protect } = require('../middleware/auth');

router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);
router.get('/balances', protect, getBalances);
router.get('/settlements', protect, getSettlements);

module.exports = router;
