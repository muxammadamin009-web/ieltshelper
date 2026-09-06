const express = require('express');
const router = express.Router();
const { getStudyItems, getDueStudyItems, reviewStudyItem } = require('../controllers/studyItemController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getStudyItems);
router.get('/due', protect, getDueStudyItems);
router.post('/:id/review', protect, reviewStudyItem);

module.exports = router;
