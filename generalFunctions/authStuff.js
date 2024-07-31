const jwt = require("jsonwebtoken");

module.exports.grabIdFromToken = (req, res) => {
    let token;
    // check for a token existing, if so, store it.
    (req.cookies.jwt) ? token = req.cookies.jwt : token = "";
    let userId = "";
    if (token) {
        jwt.verify(token, "secretString", (err, decodedToken) => {
            if (!err) {
                userId = decodedToken.id;
            }
        });
    }
    return userId;
}