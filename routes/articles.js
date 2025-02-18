const { Router } = require("express");
const router = Router();

router.get("/articles", (req, res) => {});
router.post("/articles", (req, res) => {});

router.get("/articles/:articleId", (req, res) => {});
router.put("/articles/:articleId", (req, res) => {});
router.delete("/articles/:articleId", (req, res) => {});

router.get("/articles/:articleId/comments", (req, res) => {});
router.post("/articles/:articleId/comments", (req, res) => {});
router.put("/articles/:articleId/comments/:commentId", (req, res) => {});
router.delete("/articles/:articleId/comments/:commentId", (req, res) => {});

module.exports = router;
