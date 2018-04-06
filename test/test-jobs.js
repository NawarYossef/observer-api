"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL, JWT_SECRET } = require("../config");
const { Job } = require("../jobs/model");
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
function seedJobData() {
  console.info("seeding Jobs data");
  const seedData = [];

  for (let i = 1; i <= 5; i++) {
    seedData.push(generateJobData());
  }

  // this will return a promise
  return Job.insertMany(seedData);
}

// used to generate data to put in db
function generateCompanyName() {
  const names = [
    "IBM",
    "Google",
    "Uber",
    "CNN",
    "Facebook"
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function generateCompanyLocation() {
  const addresses = [
    "123 6th St. Melbourne, FL 32904",
    "4 Goldfield Rd. Honolulu, HI 96815",
    "71 Pilgrim Avenue Chevy Chase, MD 20815",
    "514 S. Magnolia St. Orlando, FL 32806",
    "44 Shirley Ave. West Chicago, IL 60185"
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
}

function generatePositionTitle() {
  const names = [
    "developer",
    "software engineer",
    "fullstack developer",
    "rect developer",
    "javascript developer"
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function generateCompanyType() {
  const types = [
    "nonprofit",
    "startup",
    "corporation"
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function generateCompanyWebsite() {
  const urls = [
    "https://www.randomlists.com/urls",
    "https://www.cosmopolitan.com/uk/worklife/campus/a30714/time-wasting-funny-pointless-websites/",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/HiRes_BlockIsland_Aerial_7-23-2015.jpg/1200px-HiRes_BlockIsland_Aerial_7-23-2015.jpg"
  ];
  return urls[Math.floor(Math.random() * urls.length)];
}

function generateLinkJobDescription() {
  const urls = [
    "https://www.randomlists.com/urls",
    "https://www.cosmopolitan.com/uk/worklife/campus/a30714/time-wasting-funny-pointless-websites/",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/HiRes_BlockIsland_Aerial_7-23-2015.jpg/1200px-HiRes_BlockIsland_Aerial_7-23-2015.jpg"
  ];
  return urls[Math.floor(Math.random() * urls.length)];
}

function generateJobStatus() {
  const status = [
    "applied",
    "interview",
    "interested",
    "negotiate"
  ];
  return status[Math.floor(Math.random() * status.length)];
}

function generateNotes() {
  const notes = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
    "t enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

// generate an object representing a Job.
// can be used to generate seed data for db
// or request.body data
function generateJobData() {
  return {
    companyName: generateCompanyName(),
    companyLocation: generateCompanyLocation(),
    positionTitle: generatePositionTitle(),
    companyType: generateCompanyType(),
    salary: Number(faker.random.number()),
    companyWebsite: generateCompanyWebsite(),
    linkJobDescription: generateLinkJobDescription(),
    jobStatus: generateJobStatus(),
    notes: generateNotes()
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

describe("Job API resource", function () {
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
    return seedJobData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe("GET endpoint", function () {
    it("should return all existing jobs", function () {
      let res;
      return chai
        .request(app)
        .get("/api/jobs")
        // .set("Authorization", `Bearer ${validToken}`)
        .then(function (_res) {
          // so subsequent .then blocks can access res obj.
          res = _res;
          res.should.have.status(200);
          // otherwise the db seeding didn't work
          res.body.jobs.should.have.length.of.at.least(1);
          return Job.count();
        })
        .then(function (count) {
          res.body.jobs.length.should.be.equal(count);
        });
    });

    it("should return Jobs with right fields", function () {
      // Get back all Jobs, and ensure they have expected keys
      let resJob;
      return chai
        .request(app)
        .get("/api/jobs")
        // .set("Authorization", `Bearer ${validToken}`)
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.jobs.should.be.a("array");
          res.body.jobs.should.have.length.of.at.least(1);

          res.body.jobs.forEach(function (job) {
            job.should.be.a("object");
            job.should.include.keys(
              "id",
              "companyName",
              "companyLocation",
              "positionTitle",
              "companyType",
              "salary",
              "companyWebsite",
              "linkJobDescription",
              "jobStatus",
              "notes"
            );
          });
          resJob = res.body.jobs[0];
          return Job.findById(resJob.id);
        })
        .then(function (job) {
          resJob.id.should.equal(job.id);
          resJob.companyName.should.equal(job.companyName);
          resJob.companyLocation.should.equal(job.companyLocation);
          resJob.positionTitle.should.equal(job.positionTitle);
          resJob.companyType.should.equal(job.companyType);
          resJob.salary.should.equal(job.salary);
          resJob.companyWebsite.should.equal(job.companyWebsite);
          resJob.linkJobDescription.should.equal(job.linkJobDescription);
          resJob.jobStatus.should.equal(job.jobStatus);
          resJob.notes.should.equal(job.notes);
        });
    });
  });

  describe("POST endpoint", function () {
    // make a POST request with data,
    // then prove that the Job you get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it("should add a new Job", function () {
      const newJob = generateJobData();

      return chai
        .request(app)
        .post("/api/jobs")
        // .set("Authorization", `Bearer ${validToken}`)
        .send(newJob)
        .then(function (res) {
          console.log('------------------------------------');
          console.log("this is response", Object.keys(res.body))
          console.log('------------------------------------');
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a("object");
          console.log('------------------------------------');
          console.log("this is new job", Object.keys(newJob));
          console.log('------------------------------------');
          res.body.should.include.keys(
            "id",
            "companyName",
            // "companyLocation",
            "positionTitle",
            "companyType",
            "salary",
            "companyWebsite",
            "linkJobDescription",
            "jobStatus",
            "notes"
          );

          // res.body.id.should.notEqual(null);
          res.body.companyName.should.equal(newJob.companyName);
          // res.body.companyLocation.should.equal(newJob.companyLocation);
          res.body.positionTitle.should.equal(newJob.positionTitle);
          res.body.companyType.should.equal(newJob.companyType);
          res.body.salary.should.equal(newJob.salary);
          res.body.companyWebsite.should.equal(newJob.companyWebsite);
          res.body.linkJobDescription.should.equal(newJob.linkJobDescription);
          res.body.jobStatus.should.equal(newJob.jobStatus);
          res.body.notes.should.equal(newJob.notes);

          return Job.findById(res.body.id);
        })
        .then(function (job) {
          job.companyName.should.equal(newJob.companyName);
          // job.companyLocation.should.equal(newJob.companyLocation);
          job.positionTitle.should.equal(newJob.positionTitle);
          job.companyType.should.equal(newJob.companyType);
          job.salary.should.equal(newJob.salary);
          job.companyWebsite.should.equal(newJob.companyWebsite);
          job.linkJobDescription.should.equal(newJob.linkJobDescription);
          job.jobStatus.should.equal(newJob.jobStatus);
          job.notes.should.equal(newJob.notes);
        });
    });
  });

  describe("PUT endpoint", function () {
    // strategy:
    //  1. Get an existing Job from db
    //  2. Make a PUT request to update that Job
    //  3. Prove Job returned by request contains data we sent
    //  4. Prove Job in db is correctly updated
    it("should update fields sent over", function () {
      const updateData = {
        companyLocation: "144 Park Avenue",
        notes: "I wonder I wonder why this is a note",
        positionTitle: "manager"
      }

      return Job.findOne()
        .then(function (job) {
          updateData.id = job.id;

          // make request then inspect it to make sure it reflects
          // the data ent
          return chai
            .request(app)
            .put(`/api/jobs/${job.id}`)
            // .set("Authorization", `Bearer ${validToken}`)
            .send(updateData);
        })
        .then(function (res) {
          res.should.have.status(201);

          return Job.findById(updateData.id);
        })
        .then(function (job) {
          job.positionTitle.should.equal(updateData.positionTitle);
          job.companyLocation.should.equal(updateData.companyLocation);
          job.notes.should.equal(updateData.notes);
        });
    });
  });

  describe("DELETE endpoint", function () {
    // strategy:
    //  1. get a Job
    //  2. make a DELETE request for that Job's id
    //  3. assert that response has right status code
    //  4. prove that Job with the id doesn't exist in db anymore
    it("delete a Job by id", function () {
      let job;

      return Job.findOne()
        .then(function (_job) {
          job = _job;
          return chai
            .request(app)
            .delete(`/api/jobs/${job.id}`)
          // .set("Authorization", `Bearer ${validToken}`);
        })
        .then(function (res) {
          res.should.have.status(204);
          return Job.findById(job.id);
        })
        .then(function (_job) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_Job.should.be.null` would raise
          // an error. `should.be.null(_Job)` is a assertions is made
          // about a null value.
          should.not.exist(_job);
        });
    });
  });
});
