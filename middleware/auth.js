const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { Role } = require("@prisma/client");
const { create, get } = require("../queries/users");

const issueToken = async (user, req) => {
  const ip = req.headers["x-forwarded-for"] || req.ip;
  const loginAttempt = await create.loginAttempt(user.id, ip);

  if (!loginAttempt) throw new Error("Failed to create login attempt");

  const token = jwt.sign(
    { id: user.id, iat: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  const https = {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000,
    path: "/",
  };
  console.log(token);
  return { token, https };
};

const verifyToken = asyncHandler(async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await get.userById(decoded.id);

    // check if token was issued before last login
    const lastLogin = new Date(user.lastLogin.loginTime).getTime();
    if (decoded.iat < lastLogin)
      return res.status(401).json({ message: "New login needed" });

    const { password, ...data } = user;
    req.user = data;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

const isAdmin = (req, res, next) => {
  const user = req.user;
  if (user.role !== Role.ADMIN)
    return res.status(403).json({ message: "you are not an admin" });
  next();
};

const isAuthor = (req, res, next) => {
  const user = req.user;
  if (user.role !== Role.ADMIN && user.role !== Role.AUTHOR)
    return res.status(403).json({ message: "you are not an admin" });
  next();
};

const isPaying = (req, res, next) => {
  const user = req.user;
  if (!user.isPaying)
    return res
      .status(403)
      .json({ message: "you don't have an active subscription" });
  next();
};

module.exports = { issueToken, verifyToken, isAdmin, isAuthor, isPaying };
