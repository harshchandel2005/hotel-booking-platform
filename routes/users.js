const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware/auth");

const userController = require("../controllers/user");

// HOME ROUTE
router.get("/", (req, res) => {
  res.render("index.ejs");
});

// SIGNUP
router.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signUp));

// LOGIN
router.route("/login")
.get(userController.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.logIn
);

// LOGOUT
router.get("/logout", userController.logOut);

module.exports = router;
