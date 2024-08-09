const Job = require("../schemas/Job");
const { grabIdFromToken } = require("../generalFunctions/authStuff");
const mongoose = require("mongoose");

function handleErrors(err) {
    let errors = {
        jobTitle: "",
        website: "",
        employerName: "",
        employerEmail: "",
        employerPhone: "",
        employerAdress: "",
        origin: "",
        status: "",
    };

    // validation errors
    if (err.message.includes("job validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

module.exports.getJobs = async (req, res) => {
    let userId;
    try {
        userId = new mongoose.Types.ObjectId(grabIdFromToken(req));
    } catch (err) {
        console.log("token not valid");
    }
    let pageNumber;
    let maxPerPage;
    let sortType;
    let sortOrder;
    req.query.pageNumber
        ? (pageNumber = parseInt(req.query.pageNumber))
        : (pageNumber = 1);
    req.query.maxPerPage
        ? (maxPerPage = parseInt(req.query.maxPerPage))
        : (maxPerPage = 12);
    req.query.sortType
        ? (sortType = req.query.sortType)
        : (sortType = "dateOfCreation");
    req.query.sortOrder
        ? (sortOrder = parseInt(req.query.sortOrder))
        : (sortOrder = -1);
    let sortObject = {};
    sortObject[sortType] = sortOrder;
    // huge aggregate function which handles finding all the jobs we're looking for.
    // first, ignore ones not belonging to the user
    // second, count the number of jobs returned, add that to the totalJobs metadata property,
    // return pageNumber from the request and calculate totalPages using the maxPerPage property
    // and the totalJobs property.
    // third, sort according to the sortObject object, skip to the right page and limit the amount returned?
    if (userId) {
        let jobsAggregated = await Job.aggregate([
            {
                $match: { userId: userId },
            },
            {
                $facet: {
                    metaData: [
                        {
                            $count: "totalJobs",
                        },
                        {
                            $addFields: {
                                pageNumber: pageNumber,
                                totalPages: {
                                    $ceil: {
                                        $divide: ["$totalJobs", maxPerPage],
                                    },
                                },
                            },
                        },
                    ],
                    data: [
                        {
                            $sort: sortObject,
                        },
                        {
                            $skip: (pageNumber - 1) * maxPerPage,
                        },
                        {
                            $limit: maxPerPage,
                        },
                    ],
                },
            },
        ]);
        jobsAggregated = jobsAggregated[0];
        res.status(200).json(jobsAggregated);
    } else {
        res.redirect("/login");
    }
};

module.exports.getJob = async (req, res) => {
    const id = req.params.id;
    let userId = grabIdFromToken(req, res);
    job = await Job.findById(id);
    if (job.userId != userId) {
        res.status(401).json({ error: "Not authorized to see this job." });
    }
    res.status(200).json(job);
};

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
        notes,
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
            userId,
        });
        res.status(200).json({ jobApplication });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.updateJob = async (req, res) => {
    let id = req.params.id;
    let update = req.body;
    let userId = grabIdFromToken(req, res);
    try {
        job = await Job.findById(id);
        if (job.userId != userId) {
            res.status(401).json({
                error: "Not authorized to update this job.",
            });
        }
        Object.keys(update).forEach((updateEntry) => {
            job[updateEntry] = update[updateEntry];
        });
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        errors = handleErrors(err);
        res.status(400).json(errors);
    }
};

module.exports.deleteJob = async (req, res) => {
    let id = req.params.id;
    const job = await Job.findById(id);
    let userId = grabIdFromToken(req, res);
    if (job) {
        if ((job.userId = userId)) {
            try {
                await Job.deleteOne({ _id: id });
                res.status(201).json({
                    message: `Job ${id} has been succesfully deleted.`,
                });
            } catch (err) {
                res.status(400).json(err);
            }
        } else {
            res.status(401).json({
                error: "Not authorized to delete this job.",
            });
        }
    } else {
        res.status(400).json({ error: "No job was found with that id." });
    }
};
