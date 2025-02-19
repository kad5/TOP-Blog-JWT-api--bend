const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const articlesRouter = require("./routes/articles");
const adminRouter = require("./routes/admin");

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use(cookieParser()); //for the token being in an https cookie
app.use(express.json());
app.use(limiter);

/*
app.use(
  cors({
    origin: [process.env.ADMIN_ORIGIN, process.env.CLIENT_ORIGIN],
    credentials: true,
  })
);
*/
app.use(cors());
//app.set("trust proxy", true); //for correct user ip details

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/admin", adminRouter);

app.listen(3000, () => console.log("server running on port 3000"));
