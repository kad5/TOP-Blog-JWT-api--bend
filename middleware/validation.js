const { body, validationResult } = require("express-validator");

const roleEnum = ["ADMIN", "AUTHOR", "USER"];

const checks = {
  username: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 12 })
      .withMessage("Username must be between  3 and 12 characters long."),
  ],
  password: [
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long.")
      .matches(/\d/)
      .withMessage("Password must contain a number."),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
  ],
  role: [
    body("role")
      .trim()
      .customSanitizer((value) => value.toUpperCase())
      .isIn(roleEnum)
      .withMessage("Invalid role specified"),
  ],
  motto: [body("motto").optional().trim()],
  article: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty if provided")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("body")
      .trim()
      .notEmpty()
      .withMessage("the article's body cannot be empty if provided"),
    body("category")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Category cannot be empty if provided"),
  ],
  comment: [
    body("content")
      .trim()
      .notEmpty()
      .withMessage(" you cannot post empty comments"),
  ],
};

const signup = [
  checks.username[0],
  checks.password[0],
  checks.password[1],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const updateProfile = [
  (req, res, next) => {
    const activeChecks = [];
    // loops over the body to get whatever need to be validated
    Object.keys(req.body).forEach((field) => {
      if (checks[field]) {
        activeChecks.push(...checks[field]);
      }
    });
    // checks it
    Promise.all(activeChecks.map((check) => check.run(req))).then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // if passed, then adds it to the body.data for prisma
      req.body.data = Object.keys(req.body)
        .filter((key) => checks[key])
        .reduce((accumulator, key) => {
          accumulator[key] = req.body[key];
          return accumulator;
        }, {});
      // not clean by needed for the boolean isPaying
      if (req.body.isPaying !== undefined)
        req.body.data.isPaying = req.body.isPaying;
      // not clean by needed for since express validator couldnt check
      if (
        req.body.data.role === "ADMIN" &&
        req.body.adminPassword !== process.env.ADMIN_ACESS_PASS
      )
        return res.status(403).json({ message: "Wrong admin password" });
      // all good. next must be called insdie the .then since its async and if called outside it will excute before promise returns
      next();
    });
  },
];

const newArticle = [
  checks.article[0],
  checks.article[1],
  checks.article[2],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const modifyArticle = [
  (req, res, next) => {
    const activeChecks = [];
    if (req.body.title) activeChecks.push(checks.article[0]);
    if (req.body.body) activeChecks.push(checks.article[1]);
    if (req.body.category) activeChecks.push(checks.article[2]);
    Promise.all(activeChecks.map((check) => check.run(req))).then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    });
  },
];

const comment = [
  checks.comment[0],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

module.exports = {
  signup,
  updateProfile,
  newArticle,
  modifyArticle,
  comment,
};
