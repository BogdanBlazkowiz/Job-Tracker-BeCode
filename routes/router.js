const { Router } = require("express");
const jobController = require("../controllers/jobController")
const authController = require("../controllers/authController")

const router = Router();
const basePath = "/api/";

router.get(basePath+"jobs", jobController.getJobs);
router.post(basePath+"jobs", jobController.postJob);
router.put(basePath+"jobs/:id", jobController.updateJob);
router.delete(basePath+"jobs/:id", jobController.deleteJob);
router.get(basePath+"jobs/:id", jobController.getJob);
router.post(basePath + "signup", authController.signupPost);
router.post(basePath + "login", authController.loginPost);

module.exports = router;