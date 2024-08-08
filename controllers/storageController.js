const { Readable } = require("stream");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
});

// magic stuff, not entirely sure how it works, but it does, takes a buffer,
// a ressource_type and a destination folder and pipes the buffer into the cloudinary upload stream.
async function uploadStream(buffer, resourceType, folder) {
    return new Promise((res, rej) => {
    const theTransformStream = cloudinary.uploader.upload_stream(
        {resourceType, folder},
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
    let uploadedFile;
    try {
        uploadedFile = await uploadStream(buffer, "raw", "CV")
    }
    catch (err) {
        console.log(err);
    }
    return uploadedFile
}

profilePictureFileUpload = async (buffer) => {
    try {
        const uploadedFile = await uploadStream(buffer, "image", "ProfilePicture")
    }
    catch (err) {
        console.log(err)
    }
    return uploadedFile
}

deleteCloudinaryFile = async (target) => {
    return await cloudinary.uploader
    .destroy(target)
    .then(result => console.log(result));
}

uploadFiles = async (req, res) => {
    // selection of the eventual cv and profile picture files that were uploaded.
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

module.exports = {cvFileUpload, uploadFiles, profilePictureFileUpload, deleteCloudinaryFile}