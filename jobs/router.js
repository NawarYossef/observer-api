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
    "companyName",
    "companyLocation",
    "positionTitle",
    "companyType",
    "salary",
    "companyWebsite",
    "linkJobDescription",
    "jobStatus",
    "notes"
  ];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Job.create({
    companyName: req.body.companyName,
    companyLocation: req.body.location,
    positionTitle: req.body.positionTitle,
    companyType: req.body.companyType,
    salary: req.body.salary,
    companyWebsite: req.body.companyWebsite,
    linkJobDescription: req.body.linkJobDescription,
    jobStatus: req.body.jobStatus,
    notes: req.body.notes
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
    return res.status(400).json({
      error: "Request path id and request body id values must match"
    });
  }

  const updated = {};
  const updatableFields = [
    "companyName",
    "companyLocation",
    "positionTitle",
    "companyType",
    "salary",
    "companyWebsite",
    "linkJobDescription",
    "jobStatus",
    "notes"
  ];

  updatableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Job.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedJob =>   res.status(201).json(updatedJob.serialize()))
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

// ============== DELETE endpoint ==============
router.delete("/:id", (req, res) => {
    Job.findByIdAndRemove(req.params.id)
    .then(job => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = { router };
