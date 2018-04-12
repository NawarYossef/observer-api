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
  // Activity.find({ user: req.user.id })
  Activity.find()
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

// ============== GET by ID endpoint ==============
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
    "title",
    "type",
    "date",
    "topic",
    "website"
  ];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Activity.create({
    title: req.body.title,
    type: req.body.type,
    date: req.body.date,
    topic: req.body.topic,
    website: req.body.website
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
    "title",
    "type",
    "date",
    "topic",
    "website"
  ];

  updatableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Activity.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedActivity => res.status(204).json(updatedActivity.serialize()))
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

// ============== DELETE endpoint ==============
router.delete("/:id", (req, res) => {
  Activity.findByIdAndRemove(req.params.id)
    .then(activity => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = { router };
