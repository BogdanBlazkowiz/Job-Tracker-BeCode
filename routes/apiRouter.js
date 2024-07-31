const { Router } = require("express");
const jobController = require("../controllers/jobController.js")
const authController = require("../controllers/authController.js")
const storageController = require("../controllers/storageController.js")
const { uploadFields, uploadCv, uploadPfp } = require("../storage/storage.js");

const apiRouter = Router();
const baseUrl = "/api/";

apiRouter.get(baseUrl+"jobs", jobController.getJobs);
apiRouter.post(baseUrl+"jobs", jobController.postJob);
apiRouter.put(baseUrl+"jobs/:id", jobController.updateJob);
apiRouter.delete(baseUrl+"jobs/:id", jobController.deleteJob);
apiRouter.get(baseUrl+"jobs/:id", jobController.getJob);

apiRouter.post(baseUrl + "signup", uploadFields, authController.signupPost);
apiRouter.post(baseUrl + "login", authController.loginPost);
apiRouter.post(baseUrl + "upload-file", uploadFields, storageController.uploadFiles)
apiRouter.put(baseUrl + "change-files-account", uploadFields, authController.replaceCloudinaryFile);
module.exports = apiRouter;