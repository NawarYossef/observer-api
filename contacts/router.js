"use strict";
const express = require("express");
const passport = require("passport");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Contact } = require("./model");
// const jwtAuth = passport.authenticate("jwt", { session: false });

router.use(jsonParser);

// ============== GET endpoint ==============
router.get("/", (req, res) => {
  // Contact.find({ user: req.user.id })
  Contact.find()
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(contacts => {
      res.json({
        contacts: contacts.map(contact => contact.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/:id", (req, res) => {
  Contact.findById(req.params.id)
    .then(contact => res.json(contact.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went horribly awry" });
    });
});

// ============== POST endpoint ==============
router.post("/", (req, res) => {
  const requiredFields = [
    "name",
    "contactTitle",
    "email",
    "companyName",
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

  Contact.create({
    name: req.body.name,
    contactTitle: req.body.contactTitle,
    email: req.body.email,
    companyName: req.body.companyName,
    notes: req.body.notes,
  })
    .then(contact => res.status(201).json(contact.serialize()))
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
    "name",
    "contactTitle",
    "email",
    "companyName",
    "notes"
  ];

  updatableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Contact.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedContact => res.status(204).json(updatedContact.serialize()))
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

// ============== DELETE endpoint ==============
router.delete("/:id", (req, res) => {
  Contact.findByIdAndRemove(req.params.id)
    .then(contact => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = { router };
