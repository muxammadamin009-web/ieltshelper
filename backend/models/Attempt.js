const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    passage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passage',
      required: true,
    },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        userAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
      },
    ],
    score: { type: Number, default: 0 }, // number correct
    totalQuestions: { type: Number, default: 0 },
    // Approximate IELTS-style band (0-9) derived from score at submit time.
    // See backend/utils/bandScore.js - this is a rough indicator, not official.
    bandScore: { type: Number, default: null },
    // How long the student spent on this attempt, if the client reported it
    // (TestPage tracks this from when the passage loaded to submit time).
    durationSeconds: { type: Number, default: null },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
