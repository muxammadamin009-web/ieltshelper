const fs = require('fs');
const Passage = require('../models/Passage');
const Question = require('../models/Question');
const User = require('../models/User');
const StudyItem = require('../models/StudyItem');
const sanitizeHtml = require('../utils/sanitizeHtml');

// ---------- Uploads ----------

// @route POST /api/admin/upload
// Accepts a single file (field name "file"). If it's .html/.htm/.txt/.md we
// read the text back so the admin can drop it straight into a passage's body
// (bodyFormat becomes 'html' for markup files). Any other file type (pdf,
// docx, image, mp3...) is just stored and handed back as a downloadable
// attachment URL - useful for worksheets, scans of the original test, etc.
const TEXT_EXTENSIONS = ['.txt', '.md'];
const HTML_EXTENSIONS = ['.html', '.htm'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];

const uploadPassageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = require('path').extname(req.file.originalname).toLowerCase();
    const fileUrl = `/uploads/${req.file.filename}`;

    if (HTML_EXTENSIONS.includes(ext) || TEXT_EXTENSIONS.includes(ext)) {
      const raw = fs.readFileSync(req.file.path, 'utf8');
      const isHtml = HTML_EXTENSIONS.includes(ext);
      return res.status(201).json({
        kind: 'text',
        bodyFormat: isHtml ? 'html' : 'text',
        bodyText: isHtml ? sanitizeHtml(raw) : raw,
        fileUrl,
        fileName: req.file.originalname,
      });
    }

    if (AUDIO_EXTENSIONS.includes(ext)) {
      // Audio for a listening passage - handed back distinctly from a
      // generic attachment so the frontend can drop it straight into
      // `audioUrl` instead of the attachment slot. Fine for small/local
      // deployments; swap for S3/Cloudinary in production (see
      // backend/middleware/upload.js) once files/traffic grow.
      return res.status(201).json({
        kind: 'audio',
        audioUrl: fileUrl,
        fileName: req.file.originalname,
      });
    }

    // Any other file: just an attachment, doesn't touch bodyText.
    return res.status(201).json({
      kind: 'attachment',
      fileUrl,
      fileName: req.file.originalname,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// ---------- Passages ----------

// @route GET /api/admin/passages  (includes unpublished + drafts)
const getAllPassagesAdmin = async (req, res) => {
  const passages = await Passage.find().sort({ createdAt: -1 });
  return res.status(200).json({ passages });
};

// @route POST /api/admin/passages
const createPassage = async (req, res) => {
  try {
    const {
      title,
      type,
      difficulty,
      bodyText,
      bodyFormat,
      attachmentUrl,
      attachmentName,
      audioUrl,
      externalUrl,
      durationMinutes,
      published,
    } = req.body;
    const passage = await Passage.create({
      title,
      type,
      difficulty,
      bodyText,
      bodyFormat,
      attachmentUrl,
      attachmentName,
      audioUrl,
      externalUrl,
      durationMinutes: durationMinutes || null,
      published: !!published,
      createdBy: req.user._id,
    });
    return res.status(201).json({ passage });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create passage', error: err.message });
  }
};

// @route PUT /api/admin/passages/:id
const updatePassage = async (req, res) => {
  try {
    const passage = await Passage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!passage) return res.status(404).json({ message: 'Passage not found' });
    return res.status(200).json({ passage });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update passage', error: err.message });
  }
};

// @route DELETE /api/admin/passages/:id
const deletePassage = async (req, res) => {
  try {
    const passage = await Passage.findByIdAndDelete(req.params.id);
    if (!passage) return res.status(404).json({ message: 'Passage not found' });
    await Question.deleteMany({ passage: passage._id });
    return res.status(200).json({ message: 'Passage and its questions deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete passage', error: err.message });
  }
};

// ---------- Questions ----------

// @route GET /api/admin/passages/:passageId/questions  (with correct answers visible)
const getQuestionsAdmin = async (req, res) => {
  const questions = await Question.find({ passage: req.params.passageId }).sort({ order: 1 });
  return res.status(200).json({ questions });
};

// @route POST /api/admin/passages/:passageId/questions
const createQuestion = async (req, res) => {
  try {
    const { type, questionText, options, correctAnswer, order } = req.body;
    const question = await Question.create({
      passage: req.params.passageId,
      type,
      questionText,
      options,
      correctAnswer,
      order,
    });
    return res.status(201).json({ question });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
};

// @route PUT /api/admin/questions/:id
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    return res.status(200).json({ question });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update question', error: err.message });
  }
};

// @route DELETE /api/admin/questions/:id
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    return res.status(200).json({ message: 'Question deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
};

// ---------- Bulk import ----------

// @route POST /api/admin/import
// Accepts one JSON body describing a full passage + all its questions,
// and creates them together. Expected shape:
// {
//   "title": "...", "type": "reading", "difficulty": "intermediate",
//   "bodyText": "...", "audioUrl": "", "published": false,
//   "questions": [
//     { "type": "multiple_choice", "questionText": "...", "options": ["a","b"], "correctAnswer": "a", "order": 1 },
//     ...
//   ]
// }
const bulkImportPassage = async (req, res) => {
  try {
    const { title, type, difficulty, bodyText, audioUrl, externalUrl, durationMinutes, published, questions } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'title and type are required' });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: '"questions" must be a non-empty array' });
    }

    // Validate every question has the minimum required fields before writing anything
    const invalidIndex = questions.findIndex(
      (q) => !q.type || !q.questionText || q.correctAnswer === undefined || q.correctAnswer === ''
    );
    if (invalidIndex !== -1) {
      return res.status(400).json({
        message: `Question at index ${invalidIndex} is missing type, questionText, or correctAnswer`,
      });
    }

    const passage = await Passage.create({
      title,
      type,
      difficulty: difficulty || 'intermediate',
      bodyText: bodyText || '',
      audioUrl: audioUrl || '',
      externalUrl: externalUrl || '',
      durationMinutes: durationMinutes || null,
      published: !!published,
      createdBy: req.user._id,
    });

    const questionDocs = questions.map((q, i) => ({
      passage: passage._id,
      type: q.type,
      questionText: q.questionText,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      order: q.order ?? i,
    }));

    const createdQuestions = await Question.insertMany(questionDocs);

    return res.status(201).json({ passage, questions: createdQuestions });
  } catch (err) {
    return res.status(500).json({ message: 'Bulk import failed', error: err.message });
  }
};

// ---------- Users & subscriptions ----------

// @route GET /api/admin/users?search=...
// `search` (optional) matches against name or email, case-insensitive, so an
// admin can quickly find the one person they want to gift/manage instead of
// scrolling the whole user list.
const getUsersAdmin = async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search && search.trim()) {
    const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: re }, { email: re }];
  }
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  return res.status(200).json({ users, count: users.length });
};

// Accepted "gift" lengths an admin can grant in one click. 'lifetime' stores
// no expiresAt at all, so hasActiveSubscription() never expires it.
const GRANT_DURATIONS_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
  lifetime: null,
};

// @route PUT /api/admin/users/:id/subscription
// body: { duration: '7d' | '30d' | '90d' | '1y' | 'lifetime', plan?: 'monthly' | 'yearly' }
// Grants (or extends) a free subscription to any user, bypassing payment
// entirely - this is how the site owner can comp access for a friend, a
// beta tester, a support case, etc. Setting it again while already active
// extends from the current expiry rather than from now, so re-granting
// doesn't shortchange someone who still has time left.
const grantSubscription = async (req, res) => {
  try {
    const { duration, plan } = req.body;
    if (!Object.prototype.hasOwnProperty.call(GRANT_DURATIONS_DAYS, duration)) {
      return res.status(400).json({
        message: `duration must be one of: ${Object.keys(GRANT_DURATIONS_DAYS).join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const days = GRANT_DURATIONS_DAYS[duration];
    const now = new Date();
    const currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : null;
    const base = currentExpiry && currentExpiry > now ? currentExpiry : now;

    user.subscription.plan = plan || user.subscription.plan || 'yearly';
    user.subscription.status = 'active';
    user.subscription.startedAt = user.subscription.startedAt || now;
    user.subscription.expiresAt = days === null ? null : new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    // Gifted access never touches Stripe fields - keeps this cleanly
    // separate from anything a real payment later wires up for this user.

    await user.save();
    return res.status(200).json({ user: user.toObject({ getters: true, versionKey: false }) });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to grant subscription', error: err.message });
  }
};

// @route DELETE /api/admin/users/:id/subscription
// Revokes an active/gifted subscription immediately (does not touch Stripe -
// this is specifically for undoing a free grant or handling a dispute).
const revokeSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.subscription.status = 'canceled';
    user.subscription.expiresAt = new Date();
    await user.save();

    return res.status(200).json({ user: user.toObject({ getters: true, versionKey: false }) });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to revoke subscription', error: err.message });
  }
};

// ---------- Study items (vocab / grammar) ----------

// @route GET /api/admin/study-items
const getStudyItemsAdmin = async (req, res) => {
  const items = await StudyItem.find().sort({ createdAt: -1 });
  return res.status(200).json({ items });
};

// @route POST /api/admin/study-items
const createStudyItem = async (req, res) => {
  try {
    const { type, term, definition, example, externalUrl, level, published } = req.body;
    const item = await StudyItem.create({
      type,
      term,
      definition,
      example,
      externalUrl,
      level,
      published: published !== false,
      createdBy: req.user._id,
    });
    return res.status(201).json({ item });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create study item', error: err.message });
  }
};

// @route PUT /api/admin/study-items/:id
const updateStudyItem = async (req, res) => {
  try {
    const item = await StudyItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Study item not found' });
    return res.status(200).json({ item });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update study item', error: err.message });
  }
};

// @route DELETE /api/admin/study-items/:id
const deleteStudyItem = async (req, res) => {
  try {
    const item = await StudyItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Study item not found' });
    return res.status(200).json({ message: 'Study item deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete study item', error: err.message });
  }
};

module.exports = {
  uploadPassageFile,
  getAllPassagesAdmin,
  createPassage,
  updatePassage,
  deletePassage,
  getQuestionsAdmin,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportPassage,
  getUsersAdmin,
  grantSubscription,
  revokeSubscription,
  getStudyItemsAdmin,
  createStudyItem,
  updateStudyItem,
  deleteStudyItem,
};
