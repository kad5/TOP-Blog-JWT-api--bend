const prisma = require("../config/prisma");

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
    { expiresIn: "1hr" }
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

const verifyToken = (access) => {
  return async (req, res, next) => {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];
    if (!token && access === "private")
      return res.status(401).json({ message: "No token provided" });
    if (!token && access === "public") next();
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await get.userById(decoded.id);

        // check if token was issued before last login
        const lastLogin = new Date(user.lastLogin.loginTime).getTime();
        if (decoded.iat < lastLogin)
          return access === "private"
            ? res.status(401).json({ message: "New login needed" })
            : next();

        const { password, ...data } = user;
        req.user = data;
        next();
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  };
};
const isAdmin = (req, res, next) => {
  const user = req.user;
  if (user.role !== Role.ADMIN)
    return res.status(403).json({ message: "you are not an admin" });
  next();
};

const isAuthor = (req, res, next) => {
  const user = req.user;
  if (user.role !== Role.ADMIN && user.role !== Role.AUTHOR)
    return res.status(403).json({ message: "you are not an author" });
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

const ensureOwner = (table) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const id = req.params.commentId || req.params.articleId;
      console.log(userId);
      const entry =
        table === "comment"
          ? await prisma.comment.findUnique({
              where: { id: Number(id) },
              select: { authorId: true },
            })
          : await prisma.article.findUnique({
              where: { id: Number(id) },
              select: { authorId: true },
            });
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      if (entry.authorId !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to modify this entry" });
      }
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  };
};

module.exports = {
  issueToken,
  verifyToken,
  isAdmin,
  isAuthor,
  isPaying,
  ensureOwner,
};
