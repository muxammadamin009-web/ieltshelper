const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/admin');
const {
  getWritingTasks,
  getWritingTask,
  submitWriting,
  getMySubmissions,
  getSubmission,
} = require('../controllers/writingController');

router.get('/tasks', protect, getWritingTasks);
router.get('/tasks/:id', protect, getWritingTask);
// Submitting/grading an essay is gated the same way mock tests are.
router.post('/tasks/:id/submit', protect, requireActiveSubscription, submitWriting);
router.get('/submissions/me', protect, getMySubmissions);
router.get('/submissions/:id', protect, getSubmission);

module.exports = router;
