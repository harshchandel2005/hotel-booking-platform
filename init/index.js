require("dotenv").config();
const connectDB = require("../db");
const Listing = require("../models/listing");
const allData = require("./data");

const seedDB = async () => {
  await connectDB();

  await Listing.deleteMany({});
  await Listing.insertMany(
    allData.data.map(obj => ({
      ...obj,
      owner: "67f0768f254c9d8ef1c30b78"
    }))
  );

  console.log("🌱 Data seeded");
  process.exit();
};

seedDB();
