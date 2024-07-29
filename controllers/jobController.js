const Job = require("../schemas/Job");

function handleErrors (err) {
    let errors = { jobTitle: "",
        website: "",
        employerName: "",
        employerEmail: "",
        employerPhone: "",
        employerAdress: "",
        origin: "",
        status: "",
        notes: ""
    };

    // validation errors
    if (err.message.includes("job validation failed")) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

// {
//     "jobTitle": "Junior Web Dev",
//     "website": "JuniorWebDev.com",
//     "employerName": "WebEmployer",
//     "employerEmail": "webdev@employer.com",
//     "employerPhone": "+32 400-400-4004",
//     "employerAdress": "Web dev avenue, 120",
//     "origin": "Job offer",
//     "status": "sent CV",
//     "notes": "None"
// }

module.exports.getJobs = async (req, res) => {
    jobs = await Job.find();
    res.status(200).json(jobs);
}

module.exports.postJob = async (req, res) => {
    const {
        jobTitle,
        website,
        employerName,
        employerEmail,
        employerPhone,
        employerAddress,
        origin,
        status,
        notes
    } = req.body;
    try {
        const jobApplication = await Job.create({
            jobTitle,
            website,
            employerName,
            employerEmail,
            employerPhone,
            employerAddress,
            origin,
            status,
            notes
        })
        res.status(201).json(jobApplication);
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json(errors);
    }
}