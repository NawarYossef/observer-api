require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const morgan = require("morgan");
const cors = require("cors");

const { router: jobsRouter } = require('./jobs/router');
const { router: activitiesRouter } = require('./activities/router');
const { router: contactsRouter } = require('./contacts/router');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require("./config");

const app = express();

// LOGGING
app.use(morgan("common"));

// CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// ROUTERS
app.use('/api/jobs/', jobsRouter);
app.use('/api/activities/', activitiesRouter);
app.use('/api/contacts/', contactsRouter)

// basic GET request
app.get("*", (req, res) => {
  res.status(404).json({ message: "not found" });
});


let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
