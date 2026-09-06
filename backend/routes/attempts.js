const express = require('express');
const router = express.Router();
const { submitAttempt, getAttemptReview, getMyAttempts, getMyStats } = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/admin');

router.post('/:passageId', protect, requireActiveSubscription, submitAttempt);
router.get('/me', protect, getMyAttempts);
router.get('/stats', protect, getMyStats);
router.get('/:id/review', protect, getAttemptReview);

module.exports = router;
