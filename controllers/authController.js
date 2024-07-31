const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const {
    cvFileUpload,
    profilePictureFileUpload,
    deleteCloudinaryFile,
} = require("../controllers/storageController");
const { grabIdFromToken } = require("../generalFunctions/authStuff");

// 3 days
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
    return jwt.sign({ id }, "secretString", { expiresIn: maxAge });
};

module.exports.signupGet = (req, res) => {
    res.render("signup");
};

module.exports.loginGet = (req, res) => {
    res.render("login");
};

module.exports.logoutGet = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
};

module.exports.signupPost = async (req, res) => {
    const { email, password, firstName, lastName, githubLink } = req.body;
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
        console.log(profilePictureLink);
        profilePictureLink = profilePictureLink.secure_url;
    }
    try {
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
        console.log(err);
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body, "tes");
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
    user = User.findById(userId);
    if (user) {
        try {
            await User.deleteOne({ _id: userId });
            console.log(user);
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

module.exports.replaceCloudinaryFile = async (req, res) => {
    userId = grabIdFromToken(req, res);
    user = await User.findById(userId);
    const cvFile = req.files["cvFile"] ? req.files["cvFile"][0] : null;
    const profilePicture = req.files["profilePicture"]
        ? req.files["profilePicture"][0]
        : null;
    let cvLink = "";
    let profilePictureLink = "";
    [cvFile ? "cvFile" : "", profilePicture ? "profilePicture" : ""].forEach(
        async (elem) => {
            let targetFile = elem;
            let fileLink = await user.get(targetFile, "string");
            console.log(fileLink);
            // this substring starts after the superfleous part of the previous link url,
            // and removes with the split the extension, giving the public id,
            // which is the input for the deleteCloudinaryFile function
            let destroyTarget = fileLink.substr(62, 200).split(".")[0];
            console.log(destroyTarget);
            let resultOfDeletion;
            if (destroyTarget) {
                resultOfDeletion = await deleteCloudinaryFile(destroyTarget);
            }
            console.log(resultOfDeletion);
        }
    );
    if (cvFile) {
        cvLink = await cvFileUpload(cvFile.buffer);
        user.cvLink = cvLink.secure_url;
    }
    if (profilePicture) {
        profilePictureLink = await profilePictureFileUpload(
            profilePicture.buffer
        );
        user.profilePictureLink = profilePictureLink.secure_url;
    }
    user.save();
    res.status(200).json({ status: `Succesfully updated the ${targetFile}` });
};
