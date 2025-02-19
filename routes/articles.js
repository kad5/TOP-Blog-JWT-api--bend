const { Router } = require("express");
const ctrl = require("../controllers/articles");
const auth = require("../middleware/auth");
const router = Router();

router
  .route("/articles")
  .get(ctrl.getAllArticles)
  .post(auth.verifyToken, auth.isAuthor, ctrl.PostArticle);

router
  .route("/articles/:articleId")
  .get(ctrl.getArticle)
  .put(auth.verifyToken, auth.ensureOwner("article"), ctrl.updateArticle)
  .delete(auth.verifyToken, auth.ensureOwner("article"), ctrl.deleteArticle);

router
  .route("/articles/:articleId/comments")
  .get(ctrl.getAllcomments)
  .post(auth.verifyToken, ctrl.postComment);

router
  .route("/articles/:articleId/comments/:commentId")
  .put(auth.verifyToken, auth.ensureOwner("comment"), ctrl.updateComment)
  .delete(auth.verifyToken, auth.ensureOwner("comment"), ctrl.deleteComment);

module.exports = router;
