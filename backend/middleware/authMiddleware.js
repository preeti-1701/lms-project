const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {

    // Get token from headers
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided"
      });
    }

    // Remove Bearer from token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store user data in request
    req.user = decoded;

    // Continue to next step
    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

module.exports = verifyToken;