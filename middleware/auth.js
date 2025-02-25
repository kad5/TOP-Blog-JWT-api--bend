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
    // case 1: no token with public access
    if (!token && access === "public") return next();
    // case 2:no token with private access
    if (!token && access === "private")
      return res.status(401).json({ message: "No token provided" });
    // case 3: token exists
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await get.userById(decoded.id);
        // check if token was issued before last login
        const lastLogin = Math.floor(
          new Date(user.lastLogin.loginTime).getTime() / 1000
        );
        if (decoded.iat < lastLogin) {
          // cases 4 and 5 (expired token via a new login) clear cookie in both cases
          console.log("invalidated");
          return clearInvalidToken(req, res, next, access);
        }
        // case 6; success. valid token
        console.log("valid");
        const { password, ...data } = user;
        req.user = data;
        return next();
      } catch (error) {
        console.log("expired");
        // cases 7 and 8; invalid token via expired at time decoded.exp checked through jwt verify()
        return clearInvalidToken(req, res, next, access);
      }
    }
  };
};

const clearInvalidToken = (req, res, next, access) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  // this exposes the custom header to the f.end to use to to log out a user
  console.log("im being set1");
  res.header("Access-Control-Expose-Headers", "X-Auth-Expired");
  console.log("im being set2");
  if (access === "private") {
    // private route - return 401
    return res.status(401).json({ message: "New login needed" });
  } else {
    // public route - set special header before continuing to get the f.end to clear local storage (user state)
    res.set("X-Auth-Expired", "true");
    return next();
  }
};

/*
const verifyToken = (access) => {
  return async (req, res, next) => {
    //these two are for when i was sending the token manually in the test client (thunder client)
    //const header = req.headers["authorization"];
    //const token = header && header.split(" ")[1];
    const token = req.cookies.token;
    if (!token && access === "public") next();
    if (!token && access === "private")
      return res.status(401).json({ message: "No token provided" });
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await get.userById(decoded.id);
        // check if token was issued before last login
        const lastLogin =
          Math.floor(new Date(user.lastLogin.loginTime).getTime()) - 2000; // need to do that since the iat is issued in seconds and the lastlogin in the database is fetched in ms (so there is up to 999 difference in favor of last login as the iat rounds down, so need to round down the last login and add 2 seconds)
        if (decoded.iat * 1000 < lastLogin)
          return access === "private"
            ? res.status(401).json({ message: "New login needed" })
            : (res.clearCookie("token", {
                httpOnly: true,
                sameSite: "none",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 0,
              }),
              next());

        console.log(decoded.iat * 1000 + 2000);
        console.log(lastLogin);
        const { password, ...data } = user;
        req.user = data;
        next();
      } catch (error) {
        console.log("Error caught:", error.name, error.message);
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Invalid token" });
        }
      }
    }
  };
};
*/

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
