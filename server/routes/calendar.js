
const express = require('express');
const router = express.Router();
const { getEvents } = require('../controllers/calendar');
const { protect } = require('../middleware/auth');

router.get('/', protect, getEvents);

module.exports = router;
