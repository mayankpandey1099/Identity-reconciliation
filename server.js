require("dotenv").config();
const express = require("express");
const dbConnect = require("./utils/db");
const contactRouter = require("./routers/contactRoute");

const app = express();
app.use(express.json());

app.use("/", contactRouter);

app.listen(process.env.PORT || 3000 , ()=>{
    dbConnect();
    console.log(`Server running on ${process.env.PORT}`);
})
