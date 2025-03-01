const asyncHandler = require("express-async-handler");
const { create, get } = require("../queries/users");
const bcrypt = require("bcryptjs");
const { issueToken, isPaying } = require("../middleware/auth");

const signup = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const isTaken = await get.userByUsername(username);
  if (isTaken)
    return res.status(409).json({ message: "This username is already taken" });

  console.log("Request body:", req.body);
  console.log("Password type:", typeof password);
  console.log("Password:", password);

  if (typeof password !== "string") {
    return res.status(400).json({ message: "Password must be a string" });
  }

  const hashedPassword = await bcrypt.hash(String(password), Number(4));
  const user = await create.user(username, hashedPassword);

  try {
    const { token, https } = await issueToken(user, req);
    res.cookie("token", token, https);
    return res.status(201).json({ messagge: `success` });
  } catch {
    return res.status(500).json({ message: "server error" });
  }
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await get.userByUsername(username);
  if (!user)
    return res.status(401).json({ message: "invalid username or password" });
  console.log(typeof password);
  console.log(password);
  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "invalid username or password" });

  try {
    const { token, https } = await issueToken(user, req);
    res.cookie("token", token, https);
    return res.status(200).json({
      id: user.id,
      username,
      role: user.role,
      isPaying: user.isPaying,
    });
  } catch {
    return res.status(500).json({ message: "server error sending token" });
  }
});

const logout = (req, res) => {
  console.log("a user logged out");
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.status(204).end();
};

const resetPassword = asyncHandler(async (req, res) => {});

module.exports = { signup, login, logout, resetPassword };
