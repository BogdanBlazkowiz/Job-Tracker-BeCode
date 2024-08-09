const jwt = require("jsonwebtoken");
const User = require("../schemas/User")

const requireAuth = function (req, res, next) {
    const token = req.cookies.jwt;
    // check token exists and is verified
    if (token) {
        let secret_string;
        secret_string = process.env.SECRET_STRING;
        jwt.verify(token, secret_string, (err, decodedToken) => {
            if (err) {
                res.redirect("/login");
            }
            else {
                next();
            }
        });
    }
    else {
        res.redirect("/login");
    }
}

const checkUser = function (req, res, next) {
    const token = req.cookies.jwt;
    if (token) {
        let secret_string;
        secret_string = process.env.SECRET_STRING;
        jwt.verify(token, secret_string, async (err, decodedToken) => {
            if (err) {
                res.locals.lastName = null;
                next();
            }
            else {
                let user = await User.findById(decodedToken.id);
                res.locals.lastName = user.lastName;
                res.locals.firstName = user.firstName;
                next();
            }
        });
    }
    else {
        res.locals.lastName = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };