const { Router } = require("express");
const getAdminData = require("../controllers/admin");
const router = Router();

router.get("/admin", getAdminData);
module.exports = router;
