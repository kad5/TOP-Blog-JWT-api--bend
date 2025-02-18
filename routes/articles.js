const { Router } = require("express");
const ctrl = require("../controllers/articles");
const router = Router();

router.get("/articles", ctrl.getAllArticles);
router.post("/articles", ctrl.PostArticle);

router.get("/articles/:articleId", ctrl.getArticle);
router.put("/articles/:articleId", ctrl.updateArticle);
router.delete("/articles/:articleId", ctrl.deleteArticle);

router.get("/articles/:articleId/comments", ctrl.getAllcomments);
router.post("/articles/:articleId/comments", ctrl.postComment);
router.put("/articles/:articleId/comments/:commentId", ctrl.updateComment);
router.delete("/articles/:articleId/comments/:commentId", ctrl.deleteComment);

module.exports = router;
