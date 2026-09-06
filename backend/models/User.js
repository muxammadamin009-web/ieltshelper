const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },

    // --- Subscription info (basic stub - wire up to Stripe later) ---
    subscription: {
      plan: {
        type: String,
        enum: ['none', 'monthly', 'yearly'],
        default: 'none',
      },
      status: {
        type: String,
        enum: ['inactive', 'active', 'canceled', 'trialing'],
        default: 'inactive',
      },
      startedAt: { type: Date },
      expiresAt: { type: Date },
      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
    },

    // --- Simple daily activity streak (test attempts + study reviews) ---
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: null }, // stored as YYYY-MM-DD (UTC)
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Call whenever the user does a "study action" (submits a test attempt or
// reviews a study item). Bumps the streak if today is a new day, keeps it
// the same if they already logged activity today, and resets to 1 if a day
// was missed.
userSchema.methods.registerActivity = function () {
  const todayKey = new Date().toISOString().slice(0, 10);
  if (this.streak.lastActiveDate === todayKey) {
    return this.streak; // already counted today
  }
  const yesterdayKey = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  if (this.streak.lastActiveDate === yesterdayKey) {
    this.streak.current += 1;
  } else {
    this.streak.current = 1;
  }
  this.streak.longest = Math.max(this.streak.longest, this.streak.current);
  this.streak.lastActiveDate = todayKey;
  return this.streak;
};

// Helper: does this user currently have access to paid content?
userSchema.methods.hasActiveSubscription = function () {
  if (this.role === 'admin') return true;
  const { status, expiresAt } = this.subscription;
  if (status !== 'active' && status !== 'trialing') return false;
  if (expiresAt && new Date(expiresAt) < new Date()) return false;
  return true;
};

module.exports = mongoose.model('User', userSchema);
