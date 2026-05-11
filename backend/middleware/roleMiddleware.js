const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Access denied for this role' });
    }
    next();
  };
};

module.exports = roleMiddleware;
