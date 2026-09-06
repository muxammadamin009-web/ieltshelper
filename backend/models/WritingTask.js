const mongoose = require('mongoose');

const writingTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    taskType: { type: String, enum: ['task1', 'task2'], required: true },
    prompt: { type: String, required: true },
    // Task 1 often includes a chart/diagram to describe.
    imageUrl: { type: String, default: '' },
    minWords: { type: Number, default: null }, // falls back to 150/250 by taskType if unset
    timeMinutes: { type: Number, default: null }, // falls back to 20/40 by taskType
    published: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WritingTask', writingTaskSchema);
