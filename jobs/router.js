"use strict";
const express = require("express");
const passport = require("passport");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Job } = require("./model");
// const jwtAuth = passport.authenticate("jwt", { session: false });

router.use(jsonParser);

// ============== GET endpoint ==============
router.get("/", (req, res) => {
  Job.find()
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(jobs => {
      res.json({
        jobs: jobs.map(job => job.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/:id", (req, res) => {
  Job.findById(req.params.id)
    .then(job => res.json(job.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

// ============== POST endpoint ==============
router.post("/", (req, res) => {
  const requiredFields = [
    "dateDiscovered",
    "jobType",
    "companyName",
    "companyLocation",
    "position",
    "salary",
    "companyWebsite",
    "companySize",
    "linkJobDescription",
    "dateApplied",
    "contactName",
    "contactEmail",
    "codingChallengeDate",
    "techChallengeDate"
  ];

  // for (let i = 0; i < requiredFields.length; i++) {
  //   const field = requiredFields[i];
  //   if (!(field in req.body)) {
  //     const message = `Missing \`${field}\` in request body`;
  //     console.error(message);
  //     return res.status(400).send(message);
  //   }
  // }

  Job.create({
    dateDiscovered: req.body.dateDiscovered,
    jobType: req.body.jobType,
    companyName: req.body.companyName,
    companyLocation: req.body.companyLocation,
    position: req.body.position,
    salary: req.body.salary,
    companyWebsite: req.body.companyWebsite,
    companySize: req.body.companySize,
    linkJobDescription: req.body.linkJobDescription,
    dateApplied: req.body.dateApplied,
    contactName: req.body.contactName,
    contactEmail: req.body.contactEmail, 
    codingChallengeDate: req.body.codingChallengeDate, 
    techChallengeDate: req.body.techChallengeDate
    // user: req.user.id
  })
    .then(job => res.status(201).json(job.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    });
});

// ============== PUT endpoint ==============
router.put("/:id", (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: "Request path id and request body id values must match"
    });
  }

  const updated = {};
  const updatableFields = [
    "dateDiscovered",
    "jobType",
    "companyName",
    "companyLocation",
    "position",
    "salary",
    "companyWebsite",
    "companySize",
    "linkJobDescription",
    "dateApplied",
    "contactName",
    "contactEmail",
    "codingChallengeDate",
    "techChallengeDate"
  ];

  updatableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Job.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedTrip => res.status(204).json(updatedTrip.serialize()))
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

// ============== DELETE endpoint ==============
router.delete("/:id", (req, res) => {
  Trip.findByIdAndRemove(req.params.id)
    .then(job => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = { router };
