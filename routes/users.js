const { Router } = require("express");
const router = Router();

router.get("/", () => {});

router.get("/:userId", () => {});
router.put("/:userId", () => {});
router.delete("/:userId", () => {});

router.post("/:userId/favorites", () => {});
router.delete("/:userId/favorites", () => {});

module.exports = router;
