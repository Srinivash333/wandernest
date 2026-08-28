const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const listingRoutes = require("./routers/listing.js");
const reviewRoutes = require("./routers/review.js");

const MONG_URL = "mongodb://127.0.0.1:27017/wandernest";

// App setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Database connection
async function main() {
    await mongoose.connect(MONG_URL);
}

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

// Home route
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Listing routes
app.use("/listings", listingRoutes);

// Review routes
app.use("/listings", reviewRoutes);

// 404 Error
app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error.ejs", { err });
});

// Start server
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});