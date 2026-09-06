const Passage = require('../models/Passage');
const Question = require('../models/Question');

// @route GET /api/passages
// Returns published passages only (students see the catalog, no answers)
const getPassages = async (req, res) => {
  try {
    const { type } = req.query; // optional filter: reading | listening
    const filter = { published: true };
    if (type) filter.type = type;

    const passages = await Passage.find(filter)
      .select('title type difficulty audioUrl externalUrl createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ passages });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch passages', error: err.message });
  }
};

// @route GET /api/passages/:id
// Returns a single passage WITH its questions, but answers are stripped
const getPassageById = async (req, res) => {
  try {
    const passage = await Passage.findOne({ _id: req.params.id, published: true });
    if (!passage) {
      return res.status(404).json({ message: 'Passage not found' });
    }

    const questions = await Question.find({ passage: passage._id })
      .select('-correctAnswer')
      .sort({ order: 1 });

    return res.status(200).json({ passage, questions });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch passage', error: err.message });
  }
};

module.exports = { getPassages, getPassageById };
