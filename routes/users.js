const { Router } = require("express");
const ctrl = require("../controllers/users");
const auth = require("../middleware/auth");
const router = Router();

router.get("/", auth.verifyToken, ctrl.getAllUsers);

router.get("/:userId", ctrl.getUserProfile);
router.put("/:userId", auth.verifyToken, ctrl.updateUserProfile);
router.delete("/:userId", auth.verifyToken, auth.isAdmin, ctrl.deleteUser);

router.post("/:userId/favorites", auth.verifyToken, ctrl.addFav);
router.delete("/:userId/favorites", auth.verifyToken, ctrl.deleteFav);

module.exports = router;
