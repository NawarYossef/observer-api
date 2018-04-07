"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL, JWT_SECRET } = require("../config");
const { Contact } = require("../contacts/model");
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
function seedContactData() {
  console.info("seeding Contacts data");
  const seedData = [];

  for (let i = 1; i <= 5; i++) {
    seedData.push(generateContactData());
  }

  // this will return a promise
  return Contact.insertMany(seedData);
}

function generateName() {
  const name = [
    "Mark Owen",
    "Steve Jobs",
    "David Villa",
  ];
  return name[Math.floor(Math.random() * name.length)];
}

function generateContactTitle() {
  const title = [
    "developer",
    "manager",
    "recruiter",
    "student",
    "other"
  ];
  return title[Math.floor(Math.random() * title.length)];
}

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

function generateEmail() {
  const urls = [
    "https://www.randomlists.com/urls",
    "https://www.cosmopolitan.com/uk/worklife/campus/a30714/time-wasting-funny-pointless-websites/",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/HiRes_BlockIsland_Aerial_7-23-2015.jpg/1200px-HiRes_BlockIsland_Aerial_7-23-2015.jpg"
  ];
  return urls[Math.floor(Math.random() * urls.length)];
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

// generate an object representing a Contact.
// can be used to generate seed data for db
// or request.body data
function generateContactData() {
  return {
    name: generateName(),
    contactTitle: generateContactTitle(),
    email: generateEmail(),
    companyName: generateCompanyName(),
    notes: generateNotes(),
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

describe("Contact API resource", function () {
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
    return seedContactData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe("GET endpoint", function () {
    it("should return all existing contacts", function () {
      let res;
      return chai
        .request(app)
        .get("/api/contacts")
        // .set("Authorization", `Bearer ${validToken}`)
        .then(function (_res) {
          // so subsequent .then blocks can access res obj.
          res = _res;
          res.should.have.status(200);
          // otherwise the db seeding didn't work
          res.body.contacts.should.have.length.of.at.least(1);
          return Contact.count();
        })
        .then(function (count) {
          res.body.contacts.length.should.be.equal(count);
        });
    });

    it("should return contacts with right fields", function () {
      // Get back all contacts, and ensure they have expected keys
      let resContact;
      return chai
        .request(app)
        .get("/api/contacts")
        // .set("Authorization", `Bearer ${validToken}`)
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.contacts.should.be.a("array");
          res.body.contacts.should.have.length.of.at.least(1);

          res.body.contacts.forEach(function (contact) {
            contact.should.be.a("object");
            contact.should.include.keys(
              "id",
              "name",
              "contactTitle",
              "email",
              "companyName",
              "notes"
            );
          });
          resContact = res.body.contacts[0];
          return Contact.findById(resContact.id);
        })
        .then(function (contact) {

          resContact.id.should.equal(contact.id);
          resContact.name.should.equal(contact.name);
          resContact.contactTitle.should.equal(contact.contactTitle);
          resContact.email.should.equal(contact.email);
          resContact.notes.should.equal(contact.notes);
          resContact.companyName.should.equal(contact.companyName);
        });
    });
  });

  describe("POST endpoint", function () {
    // make a POST request with data,
    // then prove that the Contact you get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it("should add a new Contact", function () {
      const newContact = generateContactData();

      return chai
        .request(app)
        .post("/api/contacts")
        // .set("Authorization", `Bearer ${validToken}`)
        .send(newContact)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.include.keys(
            "id",
            "name",
            "contactTitle",
            "email",
            "companyName",
            "notes"
          );

          res.body.id.should.not.equal(null);
          res.body.name.should.equal(newContact.name);
          res.body.contactTitle.should.equal(newContact.contactTitle);
          res.body.email.should.equal(newContact.email);
          res.body.notes.should.equal(newContact.notes);
          res.body.companyName.should.equal(newContact.companyName);

          return Contact.findById(res.body.id);
        })
        .then(function (contact) {

          contact.name.should.equal(newContact.name);
          contact.contactTitle.should.equal(newContact.contactTitle);
          contact.email.should.equal(newContact.email);
          contact.notes.should.equal(newContact.notes);
          contact.companyName.should.equal(newContact.companyName);
        });
    });
  });

  describe("PUT endpoint", function () {
    // strategy:
    //  1. Get an existing Contact from db
    //  2. Make a PUT request to update that Contact
    //  3. Prove Contact returned by request contains data we sent
    //  4. Prove Contact in db is correctly updated
    it("should update fields sent over", function () {
      const updateData = {
        "name": "Ari",
        "companyName": "Airbnb"
      }

      return Contact.findOne()
        .then(function (contact) {
          updateData.id = contact.id;

          // make request then inspect it to make sure it reflects
          // the data ent
          return chai
            .request(app)
            .put(`/api/contacts/${contact.id}`)
            // .set("Authorization", `Bearer ${validToken}`)
            .send(updateData);
        })
        .then(function (res) {
          res.should.have.status(204);

          return Contact.findById(updateData.id);
        })
        .then(function (contact) {
          contact.name.should.equal(updateData.name);
          contact.companyName.should.equal(updateData.companyName);
        });
    });
  });

  describe("DELETE endpoint", function () {
    // strategy:
    //  1. get a Contact
    //  2. make a DELETE request for that Contact's id
    //  3. assert that response has right status code
    //  4. prove that Contact with the id doesn't exist in db anymore
    it("delete a Contact by id", function () {
      let contact;

      return Contact.findOne()
        .then(function (_contact) {
          contact = _contact;
          return chai
            .request(app)
            .delete(`/api/contacts/${contact.id}`)
          // .set("Authorization", `Bearer ${validToken}`);
        })
        .then(function (res) {
          res.should.have.status(204);
          return Contact.findById(contact.id);
        })
        .then(function (_contact) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_contact.should.be.null` would raise
          // an error. `should.be.null(_contact)` is a assertions is made
          // about a null value.
          should.not.exist(_contact);
        });
    });
  });
});
