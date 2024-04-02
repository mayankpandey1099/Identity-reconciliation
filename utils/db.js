require("dotenv").config();
const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    mongoose.connect(`${process.env.DBURI}`)
    console.log("db connected");
  } catch (err) {
    console.error(` mongoDb connection failed : ${err.message}`);
  }
};

module.exports = dbConnect;