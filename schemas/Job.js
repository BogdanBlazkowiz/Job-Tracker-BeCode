const mongoose = require("mongoose");

const websiteExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const phoneNumberExpression = /\+\d{2} \d{3}-\{d3}-\d{4}/

const jobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return websiteExpression.test(v);
            },
            message: props => `${props.value} is not a valid website URL.`
        }
    },
    employerName: {
        type: String,
        required: true,
    },
    employerEmail: {
        type: String,
        required: true,
        validate: [isEmail, "Please enter a valid email"]
    },
    employerPhone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return phoneNumberExpression.test(v);
            },
            message: props => `${props.value} is not a valid phone number.`
        }
    },
    employerAdress: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model("job", jobSchema);