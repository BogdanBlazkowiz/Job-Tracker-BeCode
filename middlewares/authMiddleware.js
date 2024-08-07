const jwt = require("jsonwebtoken");
const User = require("../schemas/User")

const requireAuth = function (req, res, next) {
    const token = req.cookies.jwt;
    console.log(token)
    // check token exists and is verified
    if (token) {
        jwt.verify(token, "secretString", (err, decodedToken) => {
            if (err) {
                res.redirect("/login");
            }
            else {
                console.log(decodedToken);
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
        jwt.verify(token, "secretString", async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
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
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };