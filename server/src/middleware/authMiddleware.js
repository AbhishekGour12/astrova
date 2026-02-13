import jwt from "jsonwebtoken";

/* ===============================
   COMMON AUTH (USER / ASTROLOGER / ADMIN)
================================ */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    /*
      decoded = {
        id: "...",
        role: "user" | "astrologer" | "admin",
        iat,
        exp
      }
    */

    req.user= decoded;
    console.log(req.user) // 👈 single source of truth
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* ===============================
   ROLE BASED GUARDS
================================ */
export const onlyUser = (req, res, next) => {
  console.log("Checking onlyUser guard for role:", req.user?.role); // Debug log
  if (req.user?.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "User access only",
    });
  }
  next();
};

export const onlyAstrologer = (req, res, next) => {
  if (req.user?.role !== "astrologer") {
    return res.status(403).json({
      success: false,
      message: "Astrologer access only",
    });
  }
  next();
};

export const onlyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
  next();
};
