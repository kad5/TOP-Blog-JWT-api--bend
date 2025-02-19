const asyncHandler = require("express-async-handler");
const { create, get } = require("../queries/users");
const bcrypt = require("bcryptjs");
const { issueToken } = require("../middleware/auth");

const signup = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const isTaken = await get.userByUsername(username);
  if (isTaken)
    return res.status(409).json({ message: "This username is already taken" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await create.user(username, hashedPassword);

  try {
    const { token, https } = await issueToken(user, req);
    res.cookie("token", token, https);
    return res.status(201).json({ message: `success` });
  } catch {
    return res.status(500).json({ message: "server error" });
  }
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await get.userByUsername(username);
  if (!user)
    return res.status(401).json({ message: "invalid username or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "invalid username or password" });

  try {
    const { token, https } = await issueToken(user, req);
    res.cookie("token", token, https);
    return res.status(200).json({ message: `success` });
  } catch {
    return res.status(500).json({ message: "server error" });
  }
});

const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res.status(204).end();
};

const resetPassword = asyncHandler(async (req, res) => {});

module.exports = { signup, login, logout, resetPassword };
