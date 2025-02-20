-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_articles" ("authorId", "body", "category", "createdAt", "id", "isPremium", "isPublished", "title", "updatedAt") SELECT "authorId", "body", "category", "createdAt", "id", "isPremium", "isPublished", "title", "updatedAt" FROM "articles";
DROP TABLE "articles";
ALTER TABLE "new_articles" RENAME TO "articles";
CREATE TABLE "new_comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("articleId", "authorId", "content", "createdAt", "id") SELECT "articleId", "authorId", "content", "createdAt", "id" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE TABLE "new_favorites" (
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "articleId"),
    CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorites_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_favorites" ("articleId", "userId") SELECT "articleId", "userId" FROM "favorites";
DROP TABLE "favorites";
ALTER TABLE "new_favorites" RENAME TO "favorites";
CREATE TABLE "new_last_logins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "loginTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    CONSTRAINT "last_logins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_last_logins" ("id", "ip", "loginTime", "userId") SELECT "id", "ip", "loginTime", "userId" FROM "last_logins";
DROP TABLE "last_logins";
ALTER TABLE "new_last_logins" RENAME TO "last_logins";
CREATE UNIQUE INDEX "last_logins_userId_key" ON "last_logins"("userId");
CREATE TABLE "new_login_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "loginTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_login_history" ("id", "ip", "loginTime", "userId") SELECT "id", "ip", "loginTime", "userId" FROM "login_history";
DROP TABLE "login_history";
ALTER TABLE "new_login_history" RENAME TO "login_history";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
