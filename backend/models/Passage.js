const mongoose = require('mongoose');

const passageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['reading', 'listening'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    bodyText: {
      // For reading: the passage text. For listening: optional transcript.
      type: String,
      default: '',
    },
    bodyFormat: {
      // 'text' renders bodyText as plain wrapped text.
      // 'html' renders it as sanitized-on-upload HTML (from an uploaded .html file).
      type: String,
      enum: ['text', 'html'],
      default: 'text',
    },
    attachmentUrl: {
      // Optional. A non-text file (pdf, docx, image, etc.) attached to this
      // passage - e.g. a worksheet or original scan. Shown as a download link.
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    audioUrl: {
      // Required for listening tasks - upload to S3/Cloudinary and store URL here
      type: String,
      default: '',
    },
    externalUrl: {
      // Optional. When set, students are sent to this URL to actually take the
      // test (e.g. a Google Form, another platform, etc.) instead of / in
      // addition to answering inline. Works for both reading and listening.
      type: String,
      default: '',
    },
    // Optional override for the timed-mode countdown on TestPage. If unset,
    // the frontend falls back to a sensible default per type (60 min
    // reading / 30 min listening, matching the real IELTS paper timing).
    durationMinutes: { type: Number, default: null },
    published: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Passage', passageSchema);
