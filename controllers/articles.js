const asyncHandler = require("express-async-handler");
const { create, get, update, dlt } = require("../queries/articles");

const getAllArticles = asyncHandler(async (req, res) => {
  const page = req.body.page || 1;
  const pageSize = req.body.pageSize || 10;
  const sortDirection = req.body.sortDirection || "desc";
  const freeOnly = req.body.freeOnly || false;
  const userId = req.user?.id || null;
  console.log(userId);
  const articles = await get.allArticlesList(
    page,
    pageSize,
    sortDirection,
    freeOnly,
    userId
  );
  if (!articles) return res.status(500).json({ message: "server error" });

  viewableArticles = articles.filter(
    (article) => article.isPublished || article.author.id === userId
  );
  return res.status(200).json({ viewableArticles });
});

const getArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user?.id || null;
  const article = await get.articleById(Number(articleId), userId);
  if (!article) return res.status(404).json({ message: "article not found" });
  if (
    article.isPremium &&
    (!userId || !req.user.isPaying) &&
    userId !== article.authorId
  )
    return res
      .status(403)
      .json({ message: "this article is for paid users only" });
  if (article.isPublished || article.authorId === userId) {
    return res.status(200).json({ article });
  } else
    return res.status(403).json({
      message: "The article is not published yet... you'll have to wait",
    });
});

const PostArticle = asyncHandler(async (req, res) => {
  const authorId = req.user.id;
  const { title, body } = req.body;
  const isPremium = req.body.isPremium || false;
  const isPublished = req.body.isPublished || false;
  const category = req.body.category || null;
  const article = await create.article(
    title,
    body,
    authorId,
    isPremium,
    isPublished,
    category
  );
  if (!article) return res.status(500).json({ message: "server error" });
  return res.status(200).end();
});

const updateArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const { title, body, category, isPremium, isPublished } = req.body;
  console.log(title, body, category, isPremium, isPublished);
  if (
    !articleId ||
    (!title &&
      !body &&
      !category &&
      isPremium === undefined &&
      isPublished === undefined)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid request, no data to update" });
  }
  const data = {};
  if (title) data.title = title;
  if (body) data.body = body;
  if (category) data.category = category;
  if (isPremium !== undefined) data.isPremium = isPremium;
  if (isPublished !== undefined) data.isPublished = isPublished;

  const article = await update.article(Number(articleId), data);
  if (!article) return res.status(404).json({ message: "Article not found" });
  return res.status(200).end();
});

const deleteArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  if (!articleId)
    return res
      .status(400)
      .json({ message: "incorrect article id, please try again" });
  console.log("here");
  const article = await dlt.article(Number(articleId));
  if (!article) return res.status(404).json({ message: "article not found" });
  return res.status(200).end();
});

const getAllComments = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const comments = await get.commentsByArticleId(Number(articleId));
  if (!comments) return res.status(500).json({ message: "server error" });
  return res.status(200).json({ comments });
});

const postComment = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  if (!userId || !articleId)
    return res.status(400).json({ message: "invalid request" });
  const comment = await create.comment(content, userId, Number(articleId));
  if (!comment) return res.status(500).json({ message: "server error" });
  return res.status(200).end();
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId || !content)
    return res.status(400).json({ message: "invalid request" });
  const data = { content };
  const comment = await update.comment(Number(commentId), data);
  if (!comment) return res.status(404).json({ message: "comment not found" });
  return res.status(200).end();
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) return res.status(400).json({ message: "invalid request" });
  const comment = await dlt.comment(Number(commentId));
  if (!comment) return res.status(404).json({ message: "comment not found" });
  return res.status(200).end();
});

const addFav = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { articleId } = req.body;
  try {
    await create.favorite(id, articleId);
    return res.status(200).end();
  } catch (error) {
    if (error.code === "P2002") {
      // this is the Prisma error code for unique constraint violation
      return res
        .status(400)
        .json({ message: "This article is already in your favorites." });
    }
    return res.status(500).json({ message: "server error" });
  }
});

const deleteFav = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { articleId } = req.body;
  const response = await dlt.favorite(id, articleId);
  if (!response)
    return res
      .status(404)
      .json({ message: "the article is not in your favorites" });
  return res.status(200).end();
});

module.exports = {
  getAllArticles,
  PostArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  getAllComments,
  postComment,
  updateComment,
  deleteComment,
  addFav,
  deleteFav,
};
