// Must run AFTER `protect` middleware, since it relies on req.user
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Gate for premium content - lets admins through, blocks non-subscribers
const requireActiveSubscription = (req, res, next) => {
  if (!req.user || !req.user.hasActiveSubscription()) {
    return res
      .status(403)
      .json({ message: 'An active subscription is required to access this content' });
  }
  next();
};

module.exports = { requireAdmin, requireActiveSubscription };
