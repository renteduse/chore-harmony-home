
const express = require('express');
const router = express.Router();
const {
  getChores,
  createChore,
  markChoreComplete,
  getChoreLogs
} = require('../controllers/chores');
const { protect } = require('../middleware/auth');

router.get('/', protect, getChores);
router.post('/', protect, createChore);
router.post('/:id/complete', protect, markChoreComplete);
router.get('/logs', protect, getChoreLogs);

module.exports = router;
