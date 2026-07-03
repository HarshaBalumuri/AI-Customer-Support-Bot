const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization);

  const token = req.headers.authorization?.split(" ")[1];

  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "mysecretkey"
    );

    console.log("Decoded:", decoded);

    req.user = decoded;

    next();
  } catch (err) {
    console.log("JWT Error:", err.message);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;