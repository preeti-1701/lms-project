const authorizeRoles = (...allowedRoles) => {

  return (req, res, next) => {

    // Check user role
    if (!allowedRoles.includes(req.user.role)) {

      return res.status(403).json({
        message: "Access forbidden"
      });
    }

    next();
  };
};

module.exports = authorizeRoles;