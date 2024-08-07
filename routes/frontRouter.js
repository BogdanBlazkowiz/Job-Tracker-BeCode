const { Router } = require("express");
const { requireAuth } = require("../middlewares/authMiddleware");

const frontRouter = Router();
const basePath = "../views/";
frontRouter.get("/", requireAuth, (req, res) => {
    res.render(basePath + "home.ejs")
})
frontRouter.get("/login", (req, res) => {
    res.render(basePath + "login.ejs")
});
frontRouter.get("/signup", (req, res) => {
    res.render(basePath + "signup.ejs")
});
frontRouter.get("/jobs", (req, res) => {
    res.render(basePath + "jobsPage.ejs", { maxPerPage: 20})
});
frontRouter.get("/profile", (req, res) => {
    res.render(basePath + "userPage.ejs", { maxPerPage: 20})
});
frontRouter.get("/create-job", (req, res) => {
    res.render(basePath + "jobCreate.ejs", { maxPerPage: 20})
});
frontRouter.get("/update-job", (req, res) => {
    res.render(basePath + "update-job.ejs", { maxPerPage: 20})
});

module.exports = frontRouter;