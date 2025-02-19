const { Router } = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validation");
const ctrl = require("../controllers/users");
const fav = require("../controllers/articles");

const router = Router();

router.get("/", auth.verifyToken, ctrl.getAllUsers);

router
  .route("/:userId")
  .get(ctrl.getUserProfile)
  .put(auth.verifyToken, validate.updateProfile, ctrl.updateUserProfile)
  .delete(auth.verifyToken, auth.isAdmin, ctrl.deleteUser);

router.post("/:userId/favorites", auth.verifyToken, fav.addFav);
router.delete("/:userId/favorites", auth.verifyToken, fav.deleteFav);

module.exports = router;
