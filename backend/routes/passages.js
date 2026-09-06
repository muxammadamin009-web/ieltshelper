const express = require('express');
const router = express.Router();
const { getPassages, getPassageById } = require('../controllers/passageController');
const { protect } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/admin');

// Anyone logged in can browse the catalog (titles only)
router.get('/', protect, getPassages);

// Actually opening a passage to take the test requires an active subscription
router.get('/:id', protect, requireActiveSubscription, getPassageById);

module.exports = router;
