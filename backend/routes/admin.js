const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { upload } = require('../middleware/upload');
const {
  uploadPassageFile,
  getAllPassagesAdmin,
  createPassage,
  updatePassage,
  deletePassage,
  getQuestionsAdmin,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportPassage,
  getUsersAdmin,
  grantSubscription,
  revokeSubscription,
  getStudyItemsAdmin,
  createStudyItem,
  updateStudyItem,
  deleteStudyItem,
} = require('../controllers/adminController');
const {
  getWritingTasksAdmin,
  createWritingTask,
  updateWritingTask,
  deleteWritingTask,
} = require('../controllers/writingController');

// Every route below requires a logged-in admin
router.use(protect, requireAdmin);

// File uploads (passage body from .html/.txt, or a generic attachment)
router.post('/upload', upload.single('file'), uploadPassageFile);

// Passages
router.get('/passages', getAllPassagesAdmin);
router.post('/passages', createPassage);
router.put('/passages/:id', updatePassage);
router.delete('/passages/:id', deletePassage);

// Questions (nested under a passage for create/list, flat for update/delete)
router.get('/passages/:passageId/questions', getQuestionsAdmin);
router.post('/passages/:passageId/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Bulk import (create a passage + all its questions from one JSON file/paste)
router.post('/import', bulkImportPassage);

// Users & subscriptions (?search= filters by name/email)
router.get('/users', getUsersAdmin);
// Grant or revoke a free ("gifted") subscription for any user - no payment
// involved. See adminController.grantSubscription for accepted durations.
router.put('/users/:id/subscription', grantSubscription);
router.delete('/users/:id/subscription', revokeSubscription);

// Study items (vocab / grammar)
router.get('/study-items', getStudyItemsAdmin);
router.post('/study-items', createStudyItem);
router.put('/study-items/:id', updateStudyItem);
router.delete('/study-items/:id', deleteStudyItem);

// Writing tasks (Task 1 / Task 2 prompts)
router.get('/writing-tasks', getWritingTasksAdmin);
router.post('/writing-tasks', createWritingTask);
router.put('/writing-tasks/:id', updateWritingTask);
router.delete('/writing-tasks/:id', deleteWritingTask);

module.exports = router;
