const { Router } = require("express");
const validate = require("../middleware/validation");
const ctrl = require("../controllers/auth");

const router = Router();

router.post("/sign-up", validate.signup, ctrl.signup);
router.post("/log-in", ctrl.login);
router.post("/log-out", ctrl.logout);
//router.post("/reset-password", ctrl.resetPassword);

module.exports = router;
