const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter an email."],
        unique: true,
        lowercase: true,
        validate: [isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password."],
        minlength: [6, "Minimum password length is 6 characters."]
    },
    firstName: {
        type: String,
        required: [true, "Please enter your first name."]
    },
    lastName: {
        type: String,
        required: [true, "Please enter your last name."]
    },
    githubLink : {
        type: String,
        default: ""
    },
    profilePictureLink: {
        type: String,
        default: ""
    },
    cvLink: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},
{
    toJSON: {
        getters: true
    }
})

// function on create schema child
userSchema.post("save", function (doc, next) {
    console.log("new user was created", doc);
    next();
})


userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return(user);
        }
        else {
            throw Error("incorrect password");
        }
    }
    throw Error("incorrect email");
}

const User = mongoose.model("user", userSchema);

module.exports = User;