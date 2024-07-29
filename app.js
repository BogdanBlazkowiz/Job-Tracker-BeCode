const express = require("express");
const mongoose = require("mongoose");
const Todo = require("./todoSchema");
const methodOverride = require("method-override");
const path = require("path");
const basePath = __dirname;
const port = process.env.PORT || 3000;

const app = express();


app.use(express.urlencoded({ extended: false }))
app.use(methodOverride("_method"));



// let listOfStuff = "Job TitleWebsite
// Employee Name, Email, Phone, Adress
// Origin,
//  spontaneous or offerStatus,
//   Interested, CV sent, negative, interviewComments";








app.listen(port, () => {
    console.log(`Job Tracker API listening on port ${port}`);
});