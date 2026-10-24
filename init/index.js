const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONG_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/wandernest";

// Fallback coordinates for key destinations
const locationCoordinates = {
    malibu: [-118.7798, 34.0259],
    "new york city": [-74.006, 40.7128],
    aspen: [-106.837, 39.1911],
    florence: [11.2558, 43.7696],
    portland: [-122.6784, 45.5152],
    cancun: [-86.8515, 21.1619],
    "lake tahoe": [-120.0324, 39.0968],
    "los angeles": [-118.2437, 34.0522],
    banff: [-115.5708, 51.1784],
    santorini: [25.4615, 36.3932],
    tokyo: [139.6917, 35.6895],
    kyoto: [135.7681, 35.0116],
    paris: [2.3522, 48.8566],
    london: [-0.1278, 51.5074],
    rome: [12.4964, 41.9028],
    mumbai: [72.8777, 19.076],
    delhi: [77.209, 28.6139],
    goa: [74.124, 15.2993],
    jaipur: [75.7873, 26.9124],
    dubai: [55.2708, 25.2048],
    sydney: [-33.8688, 151.2093],
    bali: [115.1889, -8.4095],
    swiss: [8.5417, 47.3769],
    alps: [10.0, 46.5],
};

function assignCategory(item) {
    const text = `${item.title} ${item.description} ${item.location}`.toLowerCase();
    if (text.includes("beach") || text.includes("ocean") || text.includes("coast")) return "Beach";
    if (text.includes("mountain") || text.includes("chalet") || text.includes("ski") || text.includes("aspen")) return "Mountains";
    if (text.includes("city") || text.includes("loft") || text.includes("downtown") || text.includes("new york") || text.includes("tokyo")) return "Iconic Cities";
    if (text.includes("castle") || text.includes("historic") || text.includes("villa") || text.includes("tuscany")) return "Castles";
    if (text.includes("pool") || text.includes("penthouse") || text.includes("luxury")) return "Amazing Pools";
    if (text.includes("camp") || text.includes("treehouse") || text.includes("cabin") || text.includes("lake")) return "Camping";
    if (text.includes("farm") || text.includes("countryside") || text.includes("cottage")) return "Farms";
    if (text.includes("snow") || text.includes("arctic") || text.includes("ice") || text.includes("banff")) return "Arctic";
    if (text.includes("boat") || text.includes("yacht") || text.includes("sail")) return "Boats";
    if (text.includes("room") || text.includes("bed")) return "Rooms";
    return "Trending";
}

function getCoords(location) {
    const loc = (location || "").toLowerCase().trim();
    for (const [key, coords] of Object.entries(locationCoordinates)) {
        if (loc.includes(key)) {
            return coords;
        }
    }
    // Default coordinates: Venice / Mediterranean center
    return [12.3155, 45.4408];
}

async function initDB() {
    try {
        await mongoose.connect(MONG_URL);
        console.log("Connected to MongoDB for seeding");

        // 1. Create or Find default demo user
        let demoUser = await User.findOne({ username: "demouser" });
        if (!demoUser) {
            demoUser = new User({
                username: "demouser",
                email: "demo@wandernest.com",
                password: "demo123", // Automatically hashed with bcrypt
            });
            await demoUser.save();
            console.log("Created demo user (demouser / demo123)");
        } else {
            console.log("Found existing demo user:", demoUser.username);
        }

        // 2. Clear old listings
        await Listing.deleteMany({});
        console.log("Cleared old listings");

        // 3. Map listings with owner, category, and Mapbox GeoJSON coordinates
        const preparedListings = initdata.data.map((obj) => ({
            ...obj,
            owner: demoUser._id,
            category: assignCategory(obj),
            geometry: {
                type: "Point",
                coordinates: getCoords(obj.location),
            },
        }));

        // 4. Insert prepared listings
        await Listing.insertMany(preparedListings);
        console.log(`Successfully seeded ${preparedListings.length} listings with Mapbox coordinates and owner!`);
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

initDB();