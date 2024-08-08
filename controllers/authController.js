const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const {
    cvFileUpload,
    profilePictureFileUpload,
    deleteCloudinaryFile,
} = require("../controllers/storageController");
const { grabIdFromToken } = require("../generalFunctions/authStuff");
const bcrypt = require("bcryptjs");

// 3 days in milliseconds
const maxAge = 3 * 86400 * 1000;

const handleErrors = (err) => {
    let errors = { email: "", password: "", firstName: "", lastName: "" };
    //incorrect email
    if (err.message === "incorrect email") {
        errors.email = "that email is not registered";
    }
    //incorrect password
    if (err.message === "incorrect password") {
        errors.password = "that password is incorrect";
    }

    // duplicate errors code
    if (err.code === 11000) {
        errors.email = "that email is already registered";
        return errors;
    }

    // validation errors
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};


const createToken = (id) => {
    let secret_string;
    secret_string = process.env.SECRET_STRING
    return jwt.sign({ id }, secret_string, { expiresIn: maxAge });
};

module.exports.logoutGet = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
};

module.exports.changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    // hash password using bcrypt
    const salt1 = await bcrypt.genSalt();
    newPasswordHashed = await bcrypt.hash(newPassword, salt1);
    try {
        // Attempt to log the user in again, to verify the password and get the user's object in the DB.
        const user = await User.login(email, oldPassword);
        user.password = newPasswordHashed;
        user.save();
        res.status(201).json({ success: "Password succesfully changed." });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};
module.exports.signupPost = async (req, res) => {
    const { email, firstName, lastName, githubLink } = req.body;

    // Password hashing, server side. Unsafe I know, but this is a proof of
    // concept of a full stack project, not too worried about safety in this specific context.
    const salt = await bcrypt.genSalt();
    let password = req.body.password;
    password = await bcrypt.hash(password, salt);

    // file handling, attempt to grab it from the request, if not,
    // make it null, then attempt to upload it to the cloudinary storage.
    const cvFile = req.files["cvFile"] ? req.files["cvFile"][0] : null;
    const profilePicture = req.files["profilePicture"]
        ? req.files["profilePicture"][0]
        : null;
    let cvLink = "";
    let profilePictureLink = "";
    if (cvFile) {
        cvLink = await cvFileUpload(cvFile.buffer);
        cvLink = cvLink.secure_url;
    }
    if (profilePicture) {
        profilePictureLink = await profilePictureFileUpload(
            profilePicture.buffer
        );
        profilePictureLink = profilePictureLink.secure_url;
    }

    try {
        // send all the data to the database, listening for errors and creating a jwt cookie
        // to keep the user logged in on subsequent visits, with a lifetime of 3 days as of this comment
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            cvLink,
            githubLink,
            profilePictureLink,
        });
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
        res.status(201).json({ user });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.deleteUser = async (req, res) => {
    userId = grabIdFromToken(req, res);
    user = await User.findById(userId);
    if (user) {
        try {
            await User.deleteOne({ _id: userId });
            res.status(201).json({
                message: `User ${id} has been succesfully deleted.`,
            });
        } catch (err) {
            res.status(400).json(err);
        }
    } else {
        res.status(400).json({ error: "No user was found with that id." });
    }
};

module.exports.getUser = async (req, res) => {
    userId = grabIdFromToken(req, res);
    user = await User.findById(userId);
    if (user) {
        // Avoid sending sensitive information to the browser.
        const cleanedUpUser = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            githubLink: user.githubLink,
            cvLink: user.cvLink,
            profilePictureLink: user.profilePictureLink,
        };
        res.status(201).json(cleanedUpUser);
    } else {
        res.status(400).json({ error: "No user was found with that id." });
    }
};

module.exports.replaceCloudinaryFile = async (req, res) => {
    userId = grabIdFromToken(req, res);
    var user = await User.findById(userId);
    const cvFile = req.files["cvFile"] ? req.files["cvFile"][0] : null;
    const profilePicture = req.files["profilePicture"]
        ? req.files["profilePicture"][0]
        : null;
    let cvLink = "";
    let profilePictureLink = "";
    // above, same as in signup
    // below, loop over a list of strings which are targets for db keys.
    [
        cvFile ? "cvLink" : "",
        profilePicture ? "profilePictureLink" : "",
    ].forEach(async (elem) => {
        if (elem) {
            let targetFile = elem;
            let fileLink = await user.get(targetFile, "string");
            // this substring starts after the superfleous part of the previous link url,
            // and removes with the split the extension, giving the public id,
            // which is the input for the deleteCloudinaryFile function

            // I know now that good practice is to save only specific information about the link,
            // but this does the job for now.
            let destroyTarget = fileLink.substr(62, 200).split(".")[0];
            let resultOfDeletion;
            if (destroyTarget) {
                resultOfDeletion = await deleteCloudinaryFile(destroyTarget);
            }
        }
    });
    let errors = { cv: "", pfp: "" };
    if (cvFile) {
        cvLink = await cvFileUpload(cvFile.buffer);
        try {
            user.cvLink = cvLink.secure_url;
        } catch (err) {
            errors.cv = "Cv upload failed.";
        }
    }
    if (profilePicture) {
        profilePictureLink = await profilePictureFileUpload(
            profilePicture.buffer
        );
        try {
            user.profilePictureLink = profilePictureLink.secure_url;
        } catch (err) {
            errors.pfp = "Profile picture upload failed.";
        }
    }
    user.save();
    if (errors.pfp || errors.cv) {
        res.status(404).json({ errors });
    } else {
        res.status(200).json({ success: `Succesfully updated the files` });
    }
};
