const chai = require("chai");
const chaiHttp = require("chai-http");

const { app } = require("../server");
chai.use(chaiHttp)

+describe("API", function() {
 it("should return status 200", function() {
    chai
      .request(app)
      .get("/api")
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json
      })
  });
});