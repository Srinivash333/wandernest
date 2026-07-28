const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONG_URL = "mongodb://127.0.0.1:27017/wandernest";

async function main() {
  await mongoose.connect(MONG_URL);
}

main()
  .then(() => {
    console.log("Connected to DB");
    initDB(); // Call initDB only after DB connection
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  try {
    // Print the data being inserted
    console.log("First Listing:");
    console.log(initdata.data[0]);

    // Delete old data
    await Listing.deleteMany({});
    console.log("Old data deleted.");

    // Insert new data
    await Listing.insertMany(initdata.data);
    console.log("New data inserted successfully!");
  } catch (err) {
    console.log(err);
  } finally {
    mongoose.connection.close();
  }
};