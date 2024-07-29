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

module.exports.getJob = async (req, res) => {
    const id = req.params.id;
    job = await Job.findById(id);
    res.status(200).json(job);
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

module.exports.updateJob = async (req, res) => {
    let id = req.params.id;
    let update = req.body;
    try {
        job = await Job.findById(id);
        Object.keys(update).forEach((updateEntry) => {
            job[updateEntry] = update[updateEntry];
        })
        await job.save();
        res.status(201).json(job);
    }
    catch (err) {
        errors = handleErrors(err);
        res.status(400).json(errors);
    }
}


module.exports.deleteJob = async (req, res) => {
    let id = req.params.id;
    const job = await Job.findById(id);
    if (job) {
        try {
            await Job.deleteOne({_id: id});
            console.log(job)
            res.status(201).json({message: `Job ${id} has been succesfully deleted.`})
        }
        catch (err) {
            res.status(400).json(err);
        }
    }
    else {
        res.status(400).json({error: "No job was found with that id."})
    }
}