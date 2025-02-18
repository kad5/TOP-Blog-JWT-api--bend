const express = require("express");
const app = express();
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const articlesRouter = require("./routes/articles");
const adminRouter = require("./routes/admin");

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/admin", adminRouter);

app.listen(3000, () => console.log("server running on port 3000"));
