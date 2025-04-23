import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Extract token from headers
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from "Bearer <token>"
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: "Invalid token" });
    req.user = decoded;  // Store decoded token data (e.g., email) for further use
    next();
  });
};

export default authMiddleware;