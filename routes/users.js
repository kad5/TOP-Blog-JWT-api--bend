const { Router } = require("express");
const ctrl = require("../controllers/users");
const router = Router();

router.get("/", ctrl.getAllUsers);

router.get("/:userId", ctrl.getUserProfile);
router.put("/:userId", ctrl.updateUserProfile);
router.delete("/:userId", ctrl.deleteUser);

router.post("/:userId/favorites", ctrl.addFav);
router.delete("/:userId/favorites", ctrl.deleteFav);

module.exports = router;
