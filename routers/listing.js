const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Route to show all listings
router.get(
    "/",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});

        res.render("listings/index", { allListings });
    })
);

// New route
router.get("/new", (req, res) => {
    res.render("listings/new");
});

// Show route - reading a single listing
router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;

        const listing = await Listing.findById(id).populate("reviews");

        res.render("listings/show", { listing });
    })
);

// Create route
router.post(
    "/",
    (req, res, next) => req.validateListing(req, res, next),
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);

        await newListing.save();

        res.redirect("/listings");
    })
);

// Edit route
router.get(
    "/:id/edit",
    wrapAsync(async (req, res) => {
        let { id } = req.params;

        const listing = await Listing.findById(id);

        res.render("listings/edit", { listing });
    })
);

// Update route
router.put(
    "/:id",
    (req, res, next) => req.validateListing(req, res, next),
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let listing = req.body.listing;

        await Listing.findByIdAndUpdate(id, listing);

        res.redirect(`/listings/${id}`);
    })
);

// Delete route
router.delete(
    "/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;

        await Listing.findByIdAndDelete(id);

        res.redirect("/listings");
    })
);

// Review route - create a new review
router.post(
    "/:id/reviews",
    (req, res, next) => req.validateReview(req, res, next),
    wrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);

        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        res.redirect(`/listings/${listing._id}`);
    })
);

// Delete route - delete a review
router.delete(
    "/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(
            id,
            { $pull: { reviews: reviewId } }
        );

        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;