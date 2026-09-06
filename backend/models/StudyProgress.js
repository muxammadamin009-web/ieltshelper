const mongoose = require('mongoose');

// Per-user, per-study-item spaced-repetition state (simplified Leitner
// system - 5 boxes, each with a fixed review interval). Not full SM-2, but
// enough to make "what's due today" a real, useful concept instead of just
// re-showing every vocab item every time.
const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 16, 35]; // index = box number

const studyProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studyItem: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyItem', required: true },
    box: { type: Number, default: 0, min: 0, max: 5 },
    timesReviewed: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
    lastReviewedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: () => new Date() }, // due immediately until first review
  },
  { timestamps: true }
);

studyProgressSchema.index({ user: 1, studyItem: 1 }, { unique: true });

// quality: 'again' | 'good' | 'easy'
studyProgressSchema.methods.applyReview = function (quality) {
  this.timesReviewed += 1;
  if (quality === 'again') {
    this.box = 0;
  } else if (quality === 'good') {
    this.box = Math.min(this.box + 1, BOX_INTERVALS_DAYS.length - 1);
    this.timesCorrect += 1;
  } else if (quality === 'easy') {
    this.box = Math.min(this.box + 2, BOX_INTERVALS_DAYS.length - 1);
    this.timesCorrect += 1;
  }
  const days = BOX_INTERVALS_DAYS[this.box];
  this.lastReviewedAt = new Date();
  this.nextReviewAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this;
};

studyProgressSchema.statics.BOX_INTERVALS_DAYS = BOX_INTERVALS_DAYS;

module.exports = mongoose.model('StudyProgress', studyProgressSchema);
