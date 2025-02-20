const { Router } = require("express");
const getAdminData = require("../controllers/admin");
const auth = require("../middleware/auth");

const router = Router();

router.get(
  "/",
  (req, res, next) => {
    console.log("admin route", next());
  },
  auth.verifyToken("private"),
  auth.isAdmin,
  getAdminData
);
module.exports = router;
