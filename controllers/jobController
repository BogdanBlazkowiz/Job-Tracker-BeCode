const Job = require("../schemas/Job");


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
        res.status(404).json(err);
    }
}