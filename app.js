require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const apiRouter = require("./routes/apiRouter");
const frontRouter = require("./routes/frontRouter");
const port = process.env.PORT || 3000;
const dbURI = process.env.DB_URI;
const cookieParser = require("cookie-parser");
const { checkUser } = require("./middlewares/authMiddleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({  extended: false }));
app.use(express.static(__dirname + "/css", {}));
app.use(express.static(__dirname + "/images", {}));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.set('view engine', 'ejs');

mongoose.connect(dbURI)
app.get("*", checkUser);
app.use(apiRouter);
app.use(frontRouter);


app.listen(port, () => {
    console.log(`Job Tracker API listening on port ${port}`);
});