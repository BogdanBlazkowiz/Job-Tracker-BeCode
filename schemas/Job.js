const mongoose = require("mongoose");
const { isEmail } = require("validator");

const websiteExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const phoneNumberExpression = /\+\d{2} \d{3}-\d{3}-\d{4}/

const jobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: [true, "Please enter a job title."],
    },
    website: {
        type: String,
        required: [true, "Please enter a website domain."]
    },
    employerName: {
        type: String,
        required: [true, "Please enter an employer name."],
    },
    employerEmail: {
        type: String,
        required: [true, "Please enter an employer email."],
        lowercase: true,
        validate: [isEmail, "Please enter a valid email."]
    },
    employerPhone: {
        type: String,
        required: [true, "Please enter an employer phone number."],
        validate: {
            validator: function(v) {
                return phoneNumberExpression.test(v);
            },
            message: props => `Invalid phone number, please use the format +11 111-111-1111.`
        }
    },
    employerAddress: {
        type: String,
        required: [true, "Please enter an employer address."],
    },
    origin: {
        type: String,
        required: [true, "Please enter an origin for the job application."],
    },
    status: {
        type: String,
        required: [true, "Please enter a status for the job application."],
    },
    notes: {
        type: String,
    }
})

module.exports = mongoose.model("job", jobSchema);