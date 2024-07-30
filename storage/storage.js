const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuration pour plusieurs champs
let uploadFields = upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "cvFile", maxCount: 1 },
]);
const uploadCv = upload.single("cvFile");
const uploadPfp = upload.single("profilePicture");
module.exports = {uploadFields, uploadCv, uploadPfp};
