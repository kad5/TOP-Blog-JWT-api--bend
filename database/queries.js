const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = {
  user: async (username, password, role) => {
    try {
      return await prisma.user.create({
        data: { username, password, role },
      });
    } catch (error) {
      throw new Error("failed to create user");
    }
  },
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
  loginKey: async (userId, ip) => {
    try {
      return await prisma.lastLogin.create({
        data: { userId, ip },
      });
    } catch (error) {
      throw new Error("failed to create the login key");
    }
  },
  loginAttempt: async (userId, ip) => {
    try {
      return await prisma.loginHistory.create({
        data: { userId, ip },
      });
    } catch (error) {
      throw new Error("failed to create a login attempt record");
    }
  },
};
const get = {
  //////////////////////// users ///////////////////////////////
  userById: async (id) => {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error("failed to find this user id");
    }
  },
  userByUsername: async (username) => {
    try {
      return await prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      throw new Error("failed to find this username");
    }
  },
  allUsersList: async () => {
    try {
      return await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
        },
        orderBy: { role: "desc" },
      });
    } catch (error) {
      throw new Error("failed to fetch users list");
    }
  },
  /*
    the next very long query to fetch a user profile can actually be separated into 4 smaller queries (user details, articles by user, user favorites, user comments) however since the dataset will be small , no need to have 4 separate fetch requests compared to just one with data consistency. I think this could perform well and be maintained till the tables are of severeal thousands entries, then separating the requests and including pagination would be the best appraoch

      sample routes for the user profile tabs
          GET /api/users/:id            // Basic info
          GET /api/users/:id/articles   // Tab 1
          GET /api/users/:id/favorites  // Tab 2
          GET /api/users/:id/comments   // Tab 3
      pagination
        const userArticles = await prisma.article.findMany({
        where: { authorId: id },
          take: 10,
          skip: page * 10,
      });
  */
  userProfile: async (id) => {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          username: true,
          motto: true,
          role: true,
          isPaying: true,
          createdAt: true,
          lastLogin: {
            select: {
              loginTime: true,
            },
          },
          articles: {
            select: {
              id: true,
              title: true,
              category: true,
              isPremium: true,
              isPublished: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: { favorites: true, comments: true },
              },
            },
          },
          favorites: {
            select: {
              article: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  isPremium: true,
                  isPublished: true,
                  createdAt: true,
                  updatedAt: true,
                  author: {
                    username: true,
                    id: true,
                  },
                  _count: {
                    select: { favorites: true, comments: true },
                  },
                },
              },
            },
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              article: {
                select: { id: true, title: true },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new Error("failed to fetch the user profile data");
    }
  },
  //////////////////////// articles ///////////////////////////////
  articleById: async (id) => {
    try {
      return await prisma.article.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error("failed to find the requested article");
    }
  },
  allArticles: async (
    page = 1,
    pageSize = 10,
    sortDirection = "desc",
    freeOnly = false
  ) => {
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
          _count: {
            select: { favorites: true, comments: true },
          },
        },
      });
      return articles;
    } catch (error) {
      throw new Error("Failed to fetch articles list.");
    }
  },

  //////////////////////// comments ///////////////////////////////
  commentById: async (userId, ip) => {
    try {
      return await prisma.lastLogin.create({
        data: { userId, ip },
      });
    } catch (error) {
      throw new Error("failed to create a login attempt");
    }
  },
  commentsByArticleId: async (userId, ip) => {
    try {
      return await prisma.lastLogin.create({
        data: { userId, ip },
      });
    } catch (error) {
      throw new Error("failed to create a login attempt");
    }
  },
};
const update = {};
const dlt = {};

module.exports = { create, get, update, dlt };
