const jwt = require("jsonwebtoken");

module.exports.grabIdFromToken = (req) => {
    let token;
    // check for a token existing, if so, store it.
    (req.cookies.jwt) ? token = req.cookies.jwt : token = "";
    let userId = "";
    if (token) {
        let secret_string;
        secret_string = process.env.SECRET_STRING;
        jwt.verify(token, secret_string, (err, decodedToken) => {
            if (!err) {
                userId = decodedToken.id;
            }
            else {
                console.log(err)
            }
        });
    }
    return userId;
}