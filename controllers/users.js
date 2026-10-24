const User = require("../models/user.js");

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username: username }, { email: email.toLowerCase() }],
        });

        if (existingUser) {
            req.flash("error", "A user with that username or email already exists.");
            return res.redirect("/signup");
        }

        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password, // Will be hashed via pre-save hook using bcrypt
        });

        const registeredUser = await newUser.save();

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to Wandernest, ${registeredUser.username}!`);
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have logged out successfully!");
        res.redirect("/listings");
    });
};
