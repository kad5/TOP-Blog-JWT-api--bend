const asyncHandler = require("express-async-handler");
const { get } = require("../queries/users");

const getAdminData = asyncHandler(async (req, res) => {
  try {
    const users = await get.adminAllUsers();
    const logins = await get.adminAllLogins();
    return res.send(200).json({ users, logins });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
});

module.exports = getAdminData;
