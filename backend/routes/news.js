const express = require('express');
const router = express.Router();
const { getNews } = require('../controllers/newsController');

// Public on purpose - it's just reading material, no auth needed to preview it.
router.get('/', getNews);

module.exports = router;
