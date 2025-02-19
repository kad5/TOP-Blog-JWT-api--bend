const asyncHandler = require("express-async-handler");
const { get, update, dlt } = require("../queries/users");

const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await get.allUsersList();
  if (!allUsers) return res.status(500).json({ message: "server error" });

  return res.status(200).json(allUsers);
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) res.status(404).json({ message: "user not found" });

  const user = await get.userProfile(userId);
  if (!user) res.status(404).json({ message: "user not found" });

  if (!req.user) {
    const { id, username, motto } = user;
    const publicProfile = { id, username, motto };
    return res.status(200).json({ state: "public", profile: publicProfile });
  }
  if (req.user && req.user !== userId) {
    const published = user.articles.filter((article) => article.isPublished);
    const favorited = user.favorites
      .filter((fav) => fav.article.isPublished)
      .map((fav) => fav.article);
    const sharedProfile = {
      ...user,
      articles: published,
      favorites: favorited,
    };
    return res.status(200).json({ state: "shared", profile: sharedProfile });
  }
  if (req?.user === userId) {
    const favorited = user.favorites
      .filter((fav) => fav.article.isPublished)
      .map((fav) => fav.article);
    const ownProfile = { ...user, favorites: favorited };
    return res.status(200).json({ state: "owner", profile: ownProfile });
  }
});
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.user; // we use req.user and not req.params so that only the owner can update his profile
  const data = req.body;

  if (id !== req.params.userId)
    return res
      .status(403)
      .json({ message: "You are not authorized to update this profile" });

  const updatedUser = await update.user(id, data);
  if (!updatedUser) return res.status(500).json({ message: "server error" });

  return res.status(200).end();
});

const deleteUser = asyncHandler(async (req, res) => {
  //this is an admin only route so we dont use the req.user.id or else the admin would delete himself :)
  const { id } = req.params;
  const deletedUser = await dlt.user(id);
  if (!deletedUser) return res.status(500).json({ message: "server error" });
  return res.status(200).end();
});

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};
