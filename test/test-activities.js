"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL, JWT_SECRET } = require("../config");
const { Activity } = require("../activities/model");
// const { User } = require("../users/model");

const username = "exampleUser";
const password = "examplePass";
const email = "exampleUser@examplePass.com";
const firstName = "Example";
const lastName = "User";
let validToken;
let id = "";

// this makes the should syntax available throughout
// this module
const should = chai.should();
chai.use(chaiHttp);

// this function is used to put randomish documents in db
// so that there is data to work with and assert about.
// the Faker library is used to automatically
// generate placeholder values for author, title, content
// and then insert that data into mongo
function seedActivityData() {
  console.info("seeding Activitys data");
  const seedData = [];

  for (let i = 1; i <= 5; i++) {
    seedData.push(generateActivityData());
  }

  // this will return a promise
  return Activity.insertMany(seedData);
}

function generateTitle() {
  const titles = [
    "React native meetup",
    "developers conference in NYC",
    "Flatiron meetup",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateType() {
  const types = [
    "networking",
    "meetup",
    "conference",
    "study",
    "other"
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function generateTopic() {
  const topics = [
    "discussion about React Native",
    "presentation about MongoDB",
    "Networking event for developers and entrepreneurs",
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}

function generateWebsite() {
  const urls = [
    "https://www.randomlists.com/urls",
    "https://www.cosmopolitan.com/uk/worklife/campus/a30714/time-wasting-funny-pointless-websites/",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/HiRes_BlockIsland_Aerial_7-23-2015.jpg/1200px-HiRes_BlockIsland_Aerial_7-23-2015.jpg"
  ];
  return urls[Math.floor(Math.random() * urls.length)];
}

function parseDate(data) {
  const month = new Date(data).toString().split(" ")[1];
  const day = new Date(data).toString().split(" ")[2];
  const year = new Date(data).toString().split(" ")[3];
  return month + " " + day + ", " + year;
}

// generate an object representing a Activity.
// can be used to generate seed data for db
// or request.body data
function generateActivityData() {
  return {
    title: generateTitle(),
    type: generateType(),
    date: parseDate(faker.date.future()),
    topic: generateTopic(),
    website: generateWebsite(),
    // user: id
  };
}

// this function deletes the entire database.
// it will be called in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn("Deleting database");
  return mongoose.connection.dropDatabase();
}

describe("Activity API resource", function () {
  // each of these hook functions are needed to return a promise
  // otherwise a callback "done" will need to be called.
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  // beforeEach(function () {
  //   return User.hashPassword(password).then(password =>
  //     User.create({
  //       username,
  //       password,
  //       email,
  //       firstName,
  //       lastName
  //     })
  //       .then(user => (id = user.id))
  //       .then(() => {
  //         validToken = jwt.sign(
  //           {
  //             user: {
  //               username,
  //               firstName,
  //               lastName,
  //               email,
  //               id
  //             },
  //             exp: Math.floor(Date.now() / 1000) + 500 // Expired ten seconds ago
  //           },
  //           JWT_SECRET,
  //           {
  //             algorithm: "HS256",
  //             subject: username
  //           }
  //         );
  //         return "";
  //       })
  //   );
  // });

  beforeEach(function () {
    return seedActivityData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe("GET endpoint", function () {
    it("should return all existing activities", function () {
      let res;
      return chai
        .request(app)
        .get("/api/activities")
        // .set("Authorization", `Bearer ${validToken}`)
        .then(function (_res) {
          // so subsequent .then blocks can access res obj.
          res = _res;
          res.should.have.status(200);
          // otherwise the db seeding didn't work
          res.body.activities.should.have.length.of.at.least(1);
          return Activity.count();
        })
        .then(function (count) {
          res.body.activities.length.should.be.equal(count);
        });
    });

    it("should return activities with right fields", function () {
      // Get back all activities, and ensure they have expected keys
      let resActivity;
      return chai
        .request(app)
        .get("/api/activities")
        // .set("Authorization", `Bearer ${validToken}`)
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.activities.should.be.a("array");
          res.body.activities.should.have.length.of.at.least(1);

          res.body.activities.forEach(function (activity) {
            activity.should.be.a("object");
            activity.should.include.keys(
              "id",
              "title",
              "type",
              "date",
              "topic",
              "website"
            );
          });
          resActivity = res.body.activities[0];
          return Activity.findById(resActivity.id);
        })
        .then(function (activity) {
          
          let activityDate = new Date(
            `${activity.date}`
          ).getMilliseconds();
          let resActivityDate = new Date(
            `${resActivity.date}`
          ).getMilliseconds();

          resActivity.id.should.equal(activity.id);
          resActivity.title.should.equal(activity.title);
          resActivity.type.should.equal(activity.type);
          resActivityDate.should.equal(activityDate);
          resActivity.topic.should.equal(activity.topic);
          resActivity.website.should.equal(activity.website);
        });
    });
  });

  describe("POST endpoint", function () {
    // make a POST request with data,
    // then prove that the Activity you get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it("should add a new Activity", function () {
      const newActivity = generateActivityData();

      return chai
        .request(app)
        .post("/api/activities")
        // .set("Authorization", `Bearer ${validToken}`)
        .send(newActivity)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.include.keys(
            "id",
            "title",
            "type",
            "date",
            "topic",
            "website"
          );

          let newActivityDate = new Date(
            `${newActivity.date}`
          ).getMilliseconds();

          let resDate = new Date(
            `${res.body.date}`
          ).getMilliseconds();

          res.body.id.should.not.equal(null);
          res.body.title.should.equal(newActivity.title);
          res.body.type.should.equal(newActivity.type);
          resDate.should.equal(newActivityDate);
          res.body.topic.should.equal(newActivity.topic);
          res.body.website.should.equal(newActivity.website);

          return Activity.findById(res.body.id);
        })
        .then(function (activity) {

          let newActivityDate = new Date(
            `${newActivity.date}`
          ).getMilliseconds();
          
          let activityDate = new Date(
            `${activity.date}`
          ).getMilliseconds();

          activity.title.should.equal(newActivity.title);
          activity.type.should.equal(newActivity.type);
          activityDate.should.equal(newActivityDate);
          activity.topic.should.equal(newActivity.topic);
          activity.website.should.equal(newActivity.website);
        });
    });
  });

  describe("PUT endpoint", function () {
    // strategy:
    //  1. Get an existing Activity from db
    //  2. Make a PUT request to update that Activity
    //  3. Prove Activity returned by request contains data we sent
    //  4. Prove Activity in db is correctly updated
    it("should update fields sent over", function () {
      const updateData = {
        "title": "study group",
        "type": "learning"
      }

      return Activity.findOne()
        .then(function (activity) {
          updateData.id = activity.id;

          // make request then inspect it to make sure it reflects
          // the data ent
          return chai
            .request(app)
            .put(`/api/activities/${activity.id}`)
            // .set("Authorization", `Bearer ${validToken}`)
            .send(updateData);
        })
        .then(function (res) {
          res.should.have.status(204);

          return Activity.findById(updateData.id);
        })
        .then(function (activity) {
          activity.title.should.equal(updateData.title);
          activity.type.should.equal(updateData.type);
        });
    });
  });

  describe("DELETE endpoint", function () {
    // strategy:
    //  1. get a Activity
    //  2. make a DELETE request for that Activity's id
    //  3. assert that response has right status code
    //  4. prove that Activity with the id doesn't exist in db anymore
    it("delete a Activity by id", function () {
      let activity;

      return Activity.findOne()
        .then(function (_activity) {
          activity = _activity;
          return chai
            .request(app)
            .delete(`/api/activities/${activity.id}`)
          // .set("Authorization", `Bearer ${validToken}`);
        })
        .then(function (res) {
          res.should.have.status(204);
          return Activity.findById(activity.id);
        })
        .then(function (_activity) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_activity.should.be.null` would raise
          // an error. `should.be.null(_activity)` is a assertions is made
          // about a null value.
          should.not.exist(_activity);
        });
    });
  });
});
