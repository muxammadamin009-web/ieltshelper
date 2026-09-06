const StudyItem = require('../models/StudyItem');
const StudyProgress = require('../models/StudyProgress');

// @route GET /api/study-items?type=vocab|grammar&level=beginner
const getStudyItems = async (req, res) => {
  try {
    const { type, level } = req.query;
    const filter = { published: true };
    if (type) filter.type = type;
    if (level) filter.level = level;

    const items = await StudyItem.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch study items', error: err.message });
  }
};

// @route GET /api/study-items/due?type=vocab|grammar
// Spaced-repetition queue: items this user hasn't reviewed yet, or whose
// next-review date has arrived. New (never-seen) items are included so the
// queue never runs dry for a student who hasn't started reviewing yet.
const getDueStudyItems = async (req, res) => {
  try {
    const { type } = req.query;
    const itemFilter = { published: true };
    if (type) itemFilter.type = type;

    const items = await StudyItem.find(itemFilter).sort({ createdAt: -1 });
    const progresses = await StudyProgress.find({
      user: req.user._id,
      studyItem: { $in: items.map((i) => i._id) },
    });
    const progressByItem = new Map(progresses.map((p) => [p.studyItem.toString(), p]));

    const now = new Date();
    const due = items
      .map((item) => {
        const progress = progressByItem.get(item._id.toString());
        return { item, progress };
      })
      .filter(({ progress }) => !progress || progress.nextReviewAt <= now)
      .map(({ item, progress }) => ({
        ...item.toObject(),
        srs: progress
          ? { box: progress.box, timesReviewed: progress.timesReviewed, nextReviewAt: progress.nextReviewAt }
          : { box: 0, timesReviewed: 0, nextReviewAt: null },
      }));

    return res.status(200).json({ items: due, totalPublished: items.length });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch due study items', error: err.message });
  }
};

// @route POST /api/study-items/:id/review
// body: { quality: 'again' | 'good' | 'easy' }
const reviewStudyItem = async (req, res) => {
  try {
    const { quality } = req.body;
    if (!['again', 'good', 'easy'].includes(quality)) {
      return res.status(400).json({ message: 'quality must be one of: again, good, easy' });
    }

    const item = await StudyItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Study item not found' });

    let progress = await StudyProgress.findOne({ user: req.user._id, studyItem: item._id });
    if (!progress) {
      progress = new StudyProgress({ user: req.user._id, studyItem: item._id });
    }
    progress.applyReview(quality);
    await progress.save();

    req.user.registerActivity();
    await req.user.save();

    return res.status(200).json({
      progress: {
        box: progress.box,
        nextReviewAt: progress.nextReviewAt,
        timesReviewed: progress.timesReviewed,
      },
      streak: req.user.streak,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to record review', error: err.message });
  }
};

module.exports = { getStudyItems, getDueStudyItems, reviewStudyItem };
