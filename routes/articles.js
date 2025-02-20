const { Router } = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validation");
const ctrl = require("../controllers/articles");

const router = Router();

router
  .route("/")
  .get(auth.verifyToken("public"), ctrl.getAllArticles)
  .post(
    auth.verifyToken("private"),
    auth.isAuthor,
    validate.newArticle,
    ctrl.PostArticle
  );

router
  .route("/:articleId")
  .get(auth.verifyToken("public"), ctrl.getArticle)
  .put(
    auth.verifyToken("private"),
    auth.ensureOwner("article"),
    validate.modifyArticle,
    ctrl.updateArticle
  )
  .delete(
    auth.verifyToken("private"),
    auth.ensureOwner("article"),
    ctrl.deleteArticle
  );

router
  .route("/:articleId/comments")
  .get(auth.verifyToken("public"), ctrl.getAllComments)
  .post(auth.verifyToken("private"), validate.comment, ctrl.postComment);

router
  .route("/:articleId/comments/:commentId")
  .put(
    auth.verifyToken("private"),
    auth.ensureOwner("comment"),
    validate.comment,
    ctrl.updateComment
  )
  .delete(
    auth.verifyToken("private"),
    auth.ensureOwner("comment"),
    ctrl.deleteComment
  );

module.exports = router;
