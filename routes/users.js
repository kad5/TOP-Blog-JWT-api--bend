const { Router } = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validation");
const ctrl = require("../controllers/users");
const fav = require("../controllers/articles");

const router = Router();

router.get("/", auth.verifyToken("private"), ctrl.getAllUsers);

router
  .route("/:userId")
  .get(auth.verifyToken("public"), ctrl.getUserProfile)
  .put(
    auth.verifyToken("private"),
    validate.updateProfile,
    ctrl.updateUserProfile
  )
  .delete(auth.verifyToken("private"), auth.isAdmin, ctrl.deleteUser);

router.post("/:userId/favorites", auth.verifyToken("private"), fav.addFav);
router.delete("/:userId/favorites", auth.verifyToken("private"), fav.deleteFav);

module.exports = router;
