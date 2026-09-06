const WritingTask = require('../models/WritingTask');
const WritingSubmission = require('../models/WritingSubmission');
const { generateWritingFeedback } = require('../utils/writingFeedback');

// ---------- Student-facing ----------

// @route GET /api/writing/tasks
const getWritingTasks = async (req, res) => {
  try {
    const tasks = await WritingTask.find({ published: true }).sort({ createdAt: -1 });
    return res.status(200).json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch writing tasks', error: err.message });
  }
};

// @route GET /api/writing/tasks/:id
const getWritingTask = async (req, res) => {
  try {
    const task = await WritingTask.findOne({ _id: req.params.id, published: true });
    if (!task) return res.status(404).json({ message: 'Writing task not found' });
    return res.status(200).json({ task });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch writing task', error: err.message });
  }
};

// @route POST /api/writing/tasks/:id/submit
// body: { essayText }
const submitWriting = async (req, res) => {
  try {
    const { essayText } = req.body;
    if (!essayText || !essayText.trim()) {
      return res.status(400).json({ message: 'essayText is required' });
    }

    const task = await WritingTask.findOne({ _id: req.params.id, published: true });
    if (!task) return res.status(404).json({ message: 'Writing task not found' });

    const feedback = generateWritingFeedback(essayText, task);

    const submission = await WritingSubmission.create({
      user: req.user._id,
      task: task._id,
      essayText,
      feedback,
    });

    req.user.registerActivity();
    await req.user.save();

    return res.status(201).json({ submission });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to submit essay', error: err.message });
  }
};

// @route GET /api/writing/submissions/me
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await WritingSubmission.find({ user: req.user._id })
      .populate('task', 'title taskType')
      .sort({ createdAt: -1 });
    return res.status(200).json({ submissions });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch submissions', error: err.message });
  }
};

// @route GET /api/writing/submissions/:id
const getSubmission = async (req, res) => {
  try {
    const submission = await WritingSubmission.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('task');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    return res.status(200).json({ submission });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch submission', error: err.message });
  }
};

// ---------- Admin ----------

// @route GET /api/admin/writing-tasks
const getWritingTasksAdmin = async (req, res) => {
  const tasks = await WritingTask.find().sort({ createdAt: -1 });
  return res.status(200).json({ tasks });
};

// @route POST /api/admin/writing-tasks
const createWritingTask = async (req, res) => {
  try {
    const { title, taskType, prompt, imageUrl, minWords, timeMinutes, published } = req.body;
    const task = await WritingTask.create({
      title,
      taskType,
      prompt,
      imageUrl,
      minWords: minWords || null,
      timeMinutes: timeMinutes || null,
      published: !!published,
      createdBy: req.user._id,
    });
    return res.status(201).json({ task });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create writing task', error: err.message });
  }
};

// @route PUT /api/admin/writing-tasks/:id
const updateWritingTask = async (req, res) => {
  try {
    const task = await WritingTask.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ message: 'Writing task not found' });
    return res.status(200).json({ task });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update writing task', error: err.message });
  }
};

// @route DELETE /api/admin/writing-tasks/:id
const deleteWritingTask = async (req, res) => {
  try {
    const task = await WritingTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Writing task not found' });
    return res.status(200).json({ message: 'Writing task deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete writing task', error: err.message });
  }
};

module.exports = {
  getWritingTasks,
  getWritingTask,
  submitWriting,
  getMySubmissions,
  getSubmission,
  getWritingTasksAdmin,
  createWritingTask,
  updateWritingTask,
  deleteWritingTask,
};
