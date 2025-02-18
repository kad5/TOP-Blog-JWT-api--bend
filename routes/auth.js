const { Router } = require("express");
const ctrl = require("../controllers/auth");
const router = Router();

router.post("/sign-up", ctrl.signup);
router.post("/log-in", ctrl.login);
router.post("/log-out", ctrl.logout);
router.post("/reset-password", ctrl.reset);

module.exports = router;
