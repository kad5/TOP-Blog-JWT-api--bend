const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const articlesRouter = require("./routes/articles");
const adminRouter = require("./routes/admin");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
const app = express();

app.use(cookieParser()); //for the token being in an https cookie
app.use(express.json());
app.use(limiter);

app.use(
  cors({
    origin: [process.env.DEV_ORIGIN, process.env.PROD_ORIGIN],
    credentials: true,
  })
);

//app.use(cors());
//app.set("trust proxy", true); //for correct user ip details

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/admin", adminRouter);

app.listen(process.env.PORT, () =>
  console.log(`server running on port ${process.env.PORT}`)
);
