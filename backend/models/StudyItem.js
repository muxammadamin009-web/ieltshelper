const mongoose = require('mongoose');

const studyItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['vocab', 'grammar'], required: true },
    term: { type: String, required: true, trim: true }, // word, or grammar point name
    definition: { type: String, required: true },
    example: { type: String, default: '' },
    externalUrl: {
      // Optional. When set, students click through to this URL to practice
      // the item on another site (e.g. a quiz/exercise platform).
      type: String,
      default: '',
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    published: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyItem', studyItemSchema);
