
const express = require('express');
const router = express.Router();
const {
  createHousehold,
  joinHousehold,
  getCurrentHousehold,
  getHouseholdMembers
} = require('../controllers/households');
const { protect } = require('../middleware/auth');

router.post('/', protect, createHousehold);
router.post('/join', protect, joinHousehold);
router.get('/current', protect, getCurrentHousehold);
router.get('/:id/members', protect, getHouseholdMembers);

module.exports = router;
