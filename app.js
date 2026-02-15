if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const listing = require("./routes/listing");
const review = require("./routes/reviews");
const userRouter = require("./routes/users.js");
const aiRoutes = require("./routes/aiRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");

const User = require("./models/user.js");
const connectDB = require("./db");

// ================== CONNECT DATABASE ==================
connectDB();

// ================== BASIC MIDDLEWARE ==================
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("layout", "layouts/boilerplate");

// ================== SESSION STORE (STABLE VERSION) ==================
const store = MongoStore.create({
  client: mongoose.connection.getClient(), // reuse existing mongoose connection
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Mongo Session Store Error:", err);
});

// ================== SESSION CONFIG ==================
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ================== PASSPORT CONFIG ==================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================== FLASH + CURRENT USER ==================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ================== ROUTES ==================
app.use("/listings", listing);
app.use("/listings/:id/reviews", review);
app.use("/", userRouter);
app.use("/", aiRoutes);
app.use("/", bookingRoutes);

// ================== 404 HANDLER ==================
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listing/error.ejs", { message });
});

// ================== SERVER ==================
app.listen(8080, () => {
  console.log("Server started on port 8080");
});
