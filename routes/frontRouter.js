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

module.exports = frontRouter;