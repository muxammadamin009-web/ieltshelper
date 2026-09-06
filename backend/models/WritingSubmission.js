const mongoose = require('mongoose');

const writingSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask', required: true },
    essayText: { type: String, required: true },
    // Snapshot of generateWritingFeedback() output at submit time - see
    // backend/utils/writingFeedback.js. Kept denormalized so past
    // submissions still show consistent feedback even if the heuristic
    // logic changes later.
    feedback: {
      wordCount: Number,
      sentenceCount: Number,
      paragraphCount: Number,
      avgSentenceLength: Number,
      bandEstimate: Number,
      notes: [String],
      disclaimer: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WritingSubmission', writingSubmissionSchema);
