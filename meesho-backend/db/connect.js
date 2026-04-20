const mongoose = require("mongoose");

const connectDB = async (url) => {
  console.log("connecting to database...");
  console.log(url);
  try {
    await mongoose.connect(url);
    console.log("Database connection successfully!");
  } catch (error) {
    console.log("Unable to connect with the database...");
    throw error;
  }
};

module.exports = connectDB;
