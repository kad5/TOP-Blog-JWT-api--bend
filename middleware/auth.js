const prisma = require("../config/prisma");

const jwt = require("jsonwebtoken");
const { Role } = require("@prisma/client");
const { create, get } = require("../queries/users");

const issueToken = async (user, req) => {
  const ip = req.headers["x-forwarded-for"] || req.ip;
  const loginAttempt = await create.loginAttempt(user.id, ip);

  if (!loginAttempt) throw new Error("Failed to create login attempt");

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1hr",
  });

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
    const token = req.cookies.token;
    if (!token) {
      console.log("no token recieved");
      return accessCheck(req, res, next, access); // make sure to reset the frontend state
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await get.userById(decoded.id);
      // check if token was issued before last login (ie: a new login attempt invalidates it)
      const lastLogin = Math.floor(
        new Date(user.lastLogin.loginTime).getTime() / 1000
      );
      if (decoded.iat < lastLogin) {
        console.log("invalidated token by a new login");
        clearInvalidToken(req, res);
        return accessCheck(req, res, next, access);
      }
      console.log("valid token");
      const { password, ...data } = user;
      req.user = data;
      return next();
    } catch (error) {
      console.log("expired token");
      clearInvalidToken(req, res);
      return accessCheck(req, res, next, access);
    }
  };
};

const accessCheck = (req, res, next, access) => {
  // a header to notify the frontend of non verified status to update the ui, the cache contorl
  // is to fix a bug where the browser cached a non verified header and served it even after log in
  res.setHeader("X-auth-custom", "not-verified");
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
  });
  if (access === "private") {
    console.log("- private route");
    return res.status(401).json({ message: "New login needed" });
  } else {
    console.log("- public route");
    return next();
  }
};

const clearInvalidToken = (req, res) => {
  console.log("cookie cleared");
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
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
