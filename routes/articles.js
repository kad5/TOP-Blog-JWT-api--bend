const { Router } = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validation");
const ctrl = require("../controllers/articles");

const router = Router();

router
  .route("/")
  .get(ctrl.getAllArticles)
  .post(auth.verifyToken, auth.isAuthor, validate.newArticle, ctrl.PostArticle);

router
  .route("/:articleId")
  .get(ctrl.getArticle)
  .put(
    auth.verifyToken,
    auth.ensureOwner("article"),
    validate.modifyArticle,
    ctrl.updateArticle
  )
  .delete(auth.verifyToken, auth.ensureOwner("article"), ctrl.deleteArticle);

router
  .route("/:articleId/comments")
  .get(ctrl.getAllComments)
  .post(auth.verifyToken, validate.comment, ctrl.postComment);

router
  .route("/:articleId/comments/:commentId")
  .put(
    auth.verifyToken,
    auth.ensureOwner("comment"),
    validate.comment,
    ctrl.updateComment
  )
  .delete(auth.verifyToken, auth.ensureOwner("comment"), ctrl.deleteComment);

module.exports = router;
