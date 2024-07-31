const Job = require("../schemas/Job");
const { grabIdFromToken } = require("../generalFunctions/authStuff");

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



module.exports.getJobs = async (req, res) => {
    let userId = grabIdFromToken(req, res);
    let jobs;
    if (userId) {
        jobs = await Job.find({userId: userId});
    }
    else {
        res.redirect("/login")
    }
    res.status(200).json(jobs);
}

module.exports.getJob = async (req, res) => {
    const id = req.params.id;
    let userId = grabIdFromToken(req, res);
    job = await Job.findById(id);
    if (job.userId != userId) {
        res.status(401).json({error: "Not authorized to see this job."})
    }
    res.status(200).json(job);
}

module.exports.postJob = async (req, res) => {
    userId = grabIdFromToken(req, res);
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
            notes,
            userId
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
    let userId = grabIdFromToken(req, res);
    try {
        job = await Job.findById(id);
        if (job.userId != userId) {
            res.status(401).json({error: "Not authorized to update this job."})
        }
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
    let userId = grabIdFromToken(req, res);
    if (job) {
        if (job.userId = userId){
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
            res.status(401).json({error: "Not authorized to delete this job."})
        }
    }
    else {
        res.status(400).json({error: "No job was found with that id."})
    }
}