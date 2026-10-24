const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controllers/users.js");
const { saveRedirectUrl } = require("../middleware.js");

// Signup routes
router
    .route("/signup")
    .get(userController.renderSignup)
    .post(wrapAsync(userController.signup));

// Login routes
router
    .route("/login")
    .get(userController.renderLogin)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );

// Logout route
router.get("/logout", userController.logout);

module.exports = router;
