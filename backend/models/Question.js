const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    passage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passage',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'multiple_choice',
        'true_false_notgiven',
        'fill_in_blank',
        'matching_headings',
        'short_answer',
      ],
      required: true,
    },
    questionText: { type: String, required: true },
    // Used for multiple_choice and matching_headings
    options: [{ type: String }],
    // Correct answer(s). For fill_in_blank/short_answer this may be an
    // array of acceptable strings (case-insensitive match).
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // String or [String]
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
