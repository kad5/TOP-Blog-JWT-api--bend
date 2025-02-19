const { Router } = require("express");
const getAdminData = require("../controllers/admin");
const auth = require("../middleware/auth");

const router = Router();

router.get("/admin", auth.verifyToken, auth.isAdmin, getAdminData);
module.exports = router;
