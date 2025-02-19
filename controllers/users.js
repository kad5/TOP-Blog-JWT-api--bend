const getAllUsers = () => {};

const getUserProfile = () => {};
const updateUserProfile = () => {};
const deleteUser = (req, res) => {
  res.json({ message: "user deleted" });
};

const addFav = () => {};
const deleteFav = () => {};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  addFav,
  deleteFav,
};
