const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Passage = require('../models/Passage');
const { scoreToBand } = require('../utils/bandScore');

const normalize = (val) =>
  typeof val === 'string' ? val.trim().toLowerCase() : val;

const isAnswerCorrect = (correctAnswer, userAnswer) => {
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.map(normalize).includes(normalize(userAnswer));
  }
  return normalize(correctAnswer) === normalize(userAnswer);
};

// @route POST /api/attempts/:passageId
// body: { answers: [{ questionId, userAnswer }], durationSeconds? }
const submitAttempt = async (req, res) => {
  try {
    const { passageId } = req.params;
    const { answers, durationSeconds } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    const passage = await Passage.findById(passageId);
    if (!passage) {
      return res.status(404).json({ message: 'Passage not found' });
    }

    const questionIds = answers.map((a) => a.questionId);
    // SECURITY FIX: scope the lookup to THIS passage's questions. Previously
    // any questionId could be graded here regardless of which passage it
    // belonged to, which meant a student could submit questionIds copied
    // from a different (possibly harder or already-seen) passage and have
    // them graded/counted against this attempt.
    const questions = await Question.find({
      _id: { $in: questionIds },
      passage: passageId,
    });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let score = 0;
    const gradedAnswers = answers.map(({ questionId, userAnswer }) => {
      const question = questionMap.get(questionId);
      const correct = question ? isAnswerCorrect(question.correctAnswer, userAnswer) : false;
      if (correct) score += 1;
      return { question: questionId, userAnswer, isCorrect: correct };
    });

    const bandScore = scoreToBand(score, answers.length);

    const attempt = await Attempt.create({
      user: req.user._id,
      passage: passageId,
      answers: gradedAnswers,
      score,
      totalQuestions: answers.length,
      bandScore,
      durationSeconds:
        typeof durationSeconds === 'number' && durationSeconds >= 0 ? durationSeconds : null,
    });

    req.user.registerActivity();
    await req.user.save();

    return res.status(201).json({ attempt, streak: req.user.streak });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to submit attempt', error: err.message });
  }
};

// @route GET /api/attempts/:id/review
// Full breakdown of one of the CURRENT USER's own attempts: every question,
// what they answered, whether it was right, and the correct answer - for a
// "review your mistakes" screen after a test.
const getAttemptReview = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'passage',
      'title type'
    );
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const questionIds = attempt.answers.map((a) => a.question);
    const questions = await Question.find({ _id: { $in: questionIds } }).sort({ order: 1 });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const breakdown = attempt.answers.map((a) => {
      const q = questionMap.get(a.question?.toString());
      return {
        questionId: a.question,
        questionText: q?.questionText || '(question no longer exists)',
        type: q?.type,
        options: q?.options || [],
        userAnswer: a.userAnswer,
        correctAnswer: q?.correctAnswer,
        isCorrect: a.isCorrect,
      };
    });

    return res.status(200).json({
      attempt: {
        _id: attempt._id,
        passage: attempt.passage,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        bandScore: attempt.bandScore,
        durationSeconds: attempt.durationSeconds,
        completedAt: attempt.completedAt,
      },
      breakdown,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attempt review', error: err.message });
  }
};

// @route GET /api/attempts/me
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('passage', 'title type')
      .sort({ createdAt: -1 });
    return res.status(200).json({ attempts });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attempts', error: err.message });
  }
};

// @route GET /api/attempts/stats
// Summary numbers for the profile page: how many distinct passages this
// user has completed, total attempts, a rough average score/band, and a
// per-question-type breakdown so students can see their weak spots.
const getMyStats = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('passage', 'title type')
      .sort({ createdAt: -1 });

    const passagesCompleted = new Set(
      attempts.filter((a) => a.passage).map((a) => a.passage._id.toString())
    ).size;

    const totalAttempts = attempts.length;

    const averageScorePercent =
      totalAttempts === 0
        ? 0
        : Math.round(
            (attempts.reduce(
              (sum, a) => sum + (a.totalQuestions ? a.score / a.totalQuestions : 0),
              0
            ) /
              totalAttempts) *
              100
          );

    const bandedAttempts = attempts.filter((a) => typeof a.bandScore === 'number');
    const averageBand = bandedAttempts.length
      ? Math.round(
          (bandedAttempts.reduce((sum, a) => sum + a.bandScore, 0) / bandedAttempts.length) * 2
        ) / 2
      : null;

    // Weak-spot breakdown by question type, across all graded answers
    const questionIds = attempts.flatMap((a) => a.answers.map((ans) => ans.question));
    const questions = await Question.find({ _id: { $in: questionIds } }).select('type');
    const typeById = new Map(questions.map((q) => [q._id.toString(), q.type]));

    const byType = {};
    attempts.forEach((a) => {
      a.answers.forEach((ans) => {
        const type = typeById.get(ans.question?.toString());
        if (!type) return;
        if (!byType[type]) byType[type] = { correct: 0, total: 0 };
        byType[type].total += 1;
        if (ans.isCorrect) byType[type].correct += 1;
      });
    });
    const questionTypeBreakdown = Object.entries(byType).map(([type, v]) => ({
      type,
      correct: v.correct,
      total: v.total,
      percent: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }));

    return res.status(200).json({
      passagesCompleted,
      totalAttempts,
      averageScorePercent,
      averageBand,
      questionTypeBreakdown,
      streak: req.user.streak,
      recentAttempts: attempts.slice(0, 5),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
};

module.exports = { submitAttempt, getAttemptReview, getMyAttempts, getMyStats };
