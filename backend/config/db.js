const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/optifit";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

module.exports = { connectDatabase };
