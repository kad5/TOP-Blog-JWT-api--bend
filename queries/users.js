const prisma = require("../config/prisma");

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
  loginAttempt: async (userId, ip) => {
    try {
      return await prisma.$transaction([
        // Update last login
        prisma.lastLogin.upsert({
          where: { userId },
          create: { userId, ip },
          update: { loginTime: new Date(), ip },
        }),
        // Create login history entry
        prisma.loginHistory.create({
          data: { userId, ip },
        }),
      ]);
    } catch (error) {
      throw new Error(
        `Failed to record login for user ${userId}: ${error.message}`
      );
    }
  },
};

const get = {
  userById: async (id) => {
    // this is used on each time the jwt is checked to check acess level & last login date (single device policy)
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: { lastLogin: true },
      });
    } catch (error) {
      throw new Error("failed to find this user id");
    }
  },
  userByUsername: async (username) => {
    // this is only used when someone is logging in, so here we dont need to lastlogin as we are making a new token
    try {
      return await prisma.user.findUnique({ where: { username } });
    } catch (error) {
      throw new Error("failed to find this username");
    }
  },
  userProfile: async (id) => {
    //review the code comments at the end of this page
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
                    select: { username: true, id: true },
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
  adminAllUsers: async () => {
    try {
      return await prisma.user.findMany({
        include: { lastLogin: true },
        orderBy: { role: "desc" },
      });
    } catch (error) {
      throw new Error("failed to fetch users list");
    }
  },
  adminAllLogins: async () => {
    try {
      return await prisma.loginHistory.findMany({
        orderBy: { loginTime: "desc" },
      });
    } catch (error) {
      throw new Error("failed to fetch users list");
    }
  },
};

const update = {
  user: async (id, data) => {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error("Failed to update user");
    }
  },
};

const dlt = {
  user: async (id) => {
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new Error("Failed to delete the user");
    }
  },
};

module.exports = { create, get, update, dlt };

/*
    the  very long query to fetch a user profile can actually be separated into 4 smaller queries (user details, articles by user, user favorites, user comments) however since the dataset will be small , no need to have 4 separate fetch requests compared to just one with data consistency. I think this could perform well and be maintained till the tables are of severeal thousands entries, then separating the requests and including pagination would be the best appraoch

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
