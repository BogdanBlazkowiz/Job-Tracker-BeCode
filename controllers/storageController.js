const { Readable } = require("stream");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
});

async function uploadStream(buffer, ressource_type, folder) {
    return new Promise((res, rej) => {
    const theTransformStream = cloudinary.uploader.upload_stream(
        {ressource_type, folder},
        (err, result) => {
        if (err) return rej(err);
        res(result);
        }
    );
    let str = Readable.from(buffer);
    str.pipe(theTransformStream);
    });
}

cvFileUpload = async (buffer) => {
    const uploadedFile = await uploadStream(buffer, "application/pdf", "CV")
    return uploadedFile
}

profilePictureFileUpload = async (buffer) => {
    const uploadedFile = await uploadStream(buffer, "image/png", "ProfilePicture")
    return uploadedFile
}



uploadFiles = async (req, res) => {
    const cvFile = req.files['cvFile'] ? req.files['cvFile'][0] : null;
    const profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0] : null;
    let upload1 = "";
    let upload2 = "";
    if (profilePicture) {
        upload2 = await profilePictureFileUpload(profilePicture.buffer);
    }
    if (cvFile) {
        upload1 = await cvFileUpload(cvFile.buffer);
    }
    res.status(200).json({upload1, upload2});
}

module.exports = {cvFileUpload, uploadFiles, profilePictureFileUpload}