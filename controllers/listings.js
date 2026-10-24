const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

// City coordinate map fallback for instant coordinates if Mapbox API is offline/rate limited
const cityFallbackCoordinates = {
    malibu: [-118.7798, 34.0259],
    "new york": [-74.006, 40.7128],
    "new york city": [-74.006, 40.7128],
    aspen: [-106.837, 39.1911],
    florence: [11.2558, 43.7696],
    portland: [-122.6784, 45.5152],
    cancun: [-86.8515, 21.1619],
    "lake tahoe": [-120.0324, 39.0968],
    banff: [-115.5708, 51.1784],
    santorini: [25.4615, 36.3932],
    tokyo: [139.6917, 35.6895],
    kyoto: [135.7681, 35.0116],
    paris: [2.3522, 48.8566],
    london: [-0.1278, 51.5074],
    rome: [12.4964, 41.9028],
    mumbai: [72.8777, 19.076],
    delhi: [77.209, 28.6139],
    "new delhi": [77.209, 28.6139],
    goa: [74.124, 15.2993],
    jaipur: [75.7873, 26.9124],
    dubai: [55.2708, 25.2048],
    sydney: [151.2093, -33.8688],
    bali: [115.1889, -8.4095],
    zurich: [8.5417, 47.3769],
    amsterdam: [4.9041, 52.3676],
};

function getFallbackCoordinates(location = "", country = "") {
    const locLower = location.toLowerCase().trim();
    for (const [key, coords] of Object.entries(cityFallbackCoordinates)) {
        if (locLower.includes(key)) {
            return coords;
        }
    }
    // Default fallback coordinates (Paris center)
    return [2.3522, 48.8566];
}

module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== "All") {
        query.category = category;
    }

    if (search && search.trim() !== "") {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { description: regex },
        ];
    }

    const allListings = await Listing.find(query).populate("owner");
    res.render("listings/index.ejs", {
        allListings,
        activeCategory: category || "All",
        searchQuery: search || "",
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {
        listing,
        mapToken: process.env.MAPBOX_TOKEN || "",
    });
};

module.exports.createListing = async (req, res) => {
    let geometry = {
        type: "Point",
        coordinates: getFallbackCoordinates(
            req.body.listing.location,
            req.body.listing.country
        ),
    };

    // Try Mapbox geocoding if token is configured
    if (geocodingClient && process.env.MAPBOX_TOKEN) {
        try {
            const geoData = await geocodingClient
                .forwardGeocode({
                    query: `${req.body.listing.location}, ${req.body.listing.country}`,
                    limit: 1,
                })
                .send();

            if (geoData?.body?.features?.length) {
                geometry = geoData.body.features[0].geometry;
            }
        } catch (err) {
            console.warn(
                "Mapbox geocoding notice: Using fallback coordinates for location.",
                err.message
            );
        }
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.geometry = geometry;

    // Handle image input
    if (typeof req.body.listing.image === "string" && req.body.listing.image.trim() !== "") {
        newListing.image = {
            url: req.body.listing.image,
            filename: "listingimage",
        };
    } else if (!newListing.image || !newListing.image.url) {
        newListing.image = {
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
            filename: "listingimage",
        };
    }

    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url || "";
    // Clean preview url if unsplash
    if (originalImageUrl.includes("unsplash.com")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        return res.redirect("/listings");
    }

    const updatedData = { ...req.body.listing };

    // Re-geocode if location or country changed
    if (
        updatedData.location !== listing.location ||
        updatedData.country !== listing.country
    ) {
        let geometry = {
            type: "Point",
            coordinates: getFallbackCoordinates(
                updatedData.location,
                updatedData.country
            ),
        };

        if (geocodingClient && process.env.MAPBOX_TOKEN) {
            try {
                const geoData = await geocodingClient
                    .forwardGeocode({
                        query: `${updatedData.location}, ${updatedData.country}`,
                        limit: 1,
                    })
                    .send();

                if (geoData?.body?.features?.length) {
                    geometry = geoData.body.features[0].geometry;
                }
            } catch (err) {
                console.warn("Mapbox geocode warning during update:", err.message);
            }
        }
        updatedData.geometry = geometry;
    }

    // Handle image update
    if (typeof updatedData.image === "string" && updatedData.image.trim() !== "") {
        updatedData.image = {
            url: updatedData.image,
            filename: "listingimage",
        };
    }

    await Listing.findByIdAndUpdate(id, updatedData, { runValidators: true });
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};
