const User = require("../schemas/User")
const jwt = require("jsonwebtoken");

const maxAge = 3 * 86400;

const handleErrors = (err) => {
    let errors = { email: "", password: "", firstName: "", lastName: ""};


    //incorrect email
    if (err.message === "incorrect email") {
        errors.email = "that email is not registered"
    }
    //incorrect password
    if (err.message === "incorrect password") {
        errors.password = "that password is incorrect"
    }

    // duplicate errors code
    if (err.code === 11000) {
        errors.email = "that email is already registered";
        return errors;
    }

    // validation errors
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const createToken = (id) => {
    return jwt.sign({ id }, "secretString", { expiresIn: maxAge });
}

module.exports.signupGet = (req, res) => {
    res.render("signup");
}

module.exports.loginGet = (req, res) => {
    res.render("login");
}

module.exports.logoutGet = (req, res) => {
    res.cookie("jwt", "", {maxAge: 1});
    res.redirect("/");
}

module.exports.signupPost = async (req, res) => {
    const { email, password, firstName, lastName, cvLink, githubLink, profilePictureLink } = req.body;
    try {
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            cvLink,
            githubLink,
            profilePictureLink
        })
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
        res.status(201).json( {user} );
    }
    catch (err) {
        console.log(err)
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
        res.status(200).json({user: user._id})
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }
}