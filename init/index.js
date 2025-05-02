const mongoose = require("mongoose");
const allData = require("./data.js");
const listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/project";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const addData = async () => {
  await listing.deleteMany({}); // 🔥 Clears old listings
  allData.data = allData.data.map((obj) => ({ ...obj, owner: "67f0768f254c9d8ef1c30b78" }));
  await listing.insertMany(allData.data);
  console.log("data is saved");
};
 
addData();


