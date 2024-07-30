const express = require("express");
const mongoose = require("mongoose");
const Job = require("./schemas/Job");
const methodOverride = require("method-override");
const path = require("path");
const router = require("./routes/router");
const basePath = __dirname;
const port = process.env.PORT || 3000;
const dbURI = "mongodb://127.0.0.1:27017/jobTracker";
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middlewares/authMiddleware");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(methodOverride("_method"));

mongoose.connect(dbURI)

app.get("*", checkUser);
app.use(router);



app.listen(port, () => {
    console.log(`Job Tracker API listening on port ${port}`);
});