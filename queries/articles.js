const prisma = require("../config/prisma");

const create = {
  article: async (title, body, authorId, isPremium, isPublished, category) => {
    try {
      return await prisma.article.create({
        data: { title, body, authorId, isPremium, isPublished, category },
      });
    } catch (error) {
      throw new Error("failed to create article");
    }
  },
  comment: async (content, userId, articleId) => {
    try {
      return await prisma.comment.create({
        data: { content, userId, articleId },
      });
    } catch (error) {
      throw new Error("failed to create comment");
    }
  },
  favorite: async (userId, articleId) => {
    try {
      return await prisma.favorite.create({
        data: { userId, articleId },
      });
    } catch (error) {
      throw new Error("failed to add to favorites");
    }
  },
};

const get = {
  articleById: async (id, userId) => {
    try {
      return await prisma.article.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, username: true, createdAt: true } },
          _count: { select: { favorites: true } },
          favorites: userId
            ? { where: { userId }, select: { id: true } }
            : false,
        },
      });
    } catch (error) {
      throw new Error("failed to find the requested article");
    }
  },
  commentsByArticleId: async (articleId) => {
    try {
      return await prisma.comment.findMany({
        where: { articleId },
        include: {
          user: { select: { id: true, username: true, createdAt: true } },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new Error("failed to fetch the comments for this article");
    }
  },
  allArticlesList: async (page, pageSize, sortDirection, freeOnly, userId) => {
    page = Math.max(1, page); // to make sure page is at least 1
    pageSize = Math.max(1, pageSize); // to make sure pageSize is at least 1 article
    const skip = (page - 1) * pageSize;
    const orderBy = { createdAt: sortDirection };
    const where = freeOnly === true ? { isPremium: false } : {};

    try {
      const articles = await prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          title: true,
          isPremium: true,
          isPublished: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, username: true, createdAt: true } },
          _count: { select: { favorites: true, comments: true } },
          favorites: userId
            ? { where: { userId }, select: { id: true } } // to check if the user likes it
            : false, //return false meaning it is a public viewer
        },
      });
      return articles;
    } catch (error) {
      throw new Error("Failed to fetch the articles list.");
    }
  },
};

const update = {
  article: async (id, data) => {
    try {
      return await prisma.article.update({ where: { id }, data });
    } catch (error) {
      throw new Error("Failed to update the acticle");
    }
  },
  comment: async (id, data) => {
    try {
      return await prisma.comment.update({ where: { id }, data });
    } catch (error) {
      throw new Error("Failed to update the comment");
    }
  },
};
const dlt = {
  article: async (id) => {
    try {
      return await prisma.article.delete({ where: { id } });
    } catch (error) {
      throw new Error("Failed to delete the acticle");
    }
  },
  comment: async (id, userId) => {
    try {
      return await prisma.comment.delete({ where: { id } });
    } catch (error) {
      throw new Error("Failed to delete this comment");
    }
  },
  favorite: async (id) => {
    try {
      return await prisma.favorite.delete({ where: { id } });
    } catch (error) {
      throw new Error("Failed to unlike the article");
    }
  },
};

module.exports = { create, get, update, dlt };
