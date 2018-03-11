"use strict";
const express = require("express");
const passport = require("passport");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Activity } = require("./model");
// const jwtAuth = passport.authenticate("jwt", { session: false });

router.use(jsonParser);

// ============== GET endpoint ==============
router.get("/", (req, res) => {
  Activity.find({ user: req.user.id })
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(activities => {
      res.json({
        activities: activities.map(activity => activity.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/:id", (req, res) => {
  Activity.findById(req.params.id)
    .then(activity => res.json(activity.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

// ============== POST endpoint ==============
router.post("/", (req, res) => {
  const requiredFields = [
    "dateDiscovered",
    "activityType",
    "companyName",
    "companyLocation",
    "Position",
    "Salary",
    "companySize",
    "companyWebsite",
    "activityDescriptionWebsite"
  ];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  activity.create({
    dateDiscovered: req.body.dateDiscovered,
    activityType: req.body.activityType,
    companyName: req.body.companyName,
    companyLocation: req.body.companyLocation,
    Position: req.body.Position,
    Salary: req.body.Salary,
    companySize: req.body.companySize,
    companyWebsite: req.body.companyWebsite,
    activityDescriptionWebsite: req.body.activityDescriptionWebsite,
    user: req.user.id
  })
    .then(activity => res.status(201).json(activity.serialize()))
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
    "activityType",
    "companyName",
    "companyLocation",
    "Position",
    "Salary",
    "companySize",
    "companyWebsite",
    "activityDescriptionWebsite"
  ];

  updatableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Activity.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedTrip => res.status(204).json(updatedTrip.serialize()))
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

// ============== DELETE endpoint ==============
router.delete("/:id", (req, res) => {
  Activity.findByIdAndRemove(req.params.id)
    .then(activity => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = { router };
