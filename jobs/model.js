const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  companyName: { type: String, required: true },
  companyLocation: { type: String, required: false },
  positionTitle: { type: String, required: false },
  companyType: { type: String, required: false },
  salary: { type: Number, required: false },
  companyWebsite: { type: String, required: false },
  linkJobDescription: { type: String, required: false },
  jobStatus: { type: String, required: false },
  notes: { type: String, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

JobSchema.methods.serialize = function() {
  return {
    id: this._id,
    companyName: this.companyName,
    companyLocation: this.companyLocation,
    positionTitle: this.positionTitle,
    companyType: this.companyType,
    salary: this.salary,
    companyWebsite: this.companyWebsite,
    linkJobDescription: this.linkJobDescription,
    jobStatus: this.jobStatus,
    notes: this.notes,
  };
};

const Job = mongoose.model("Job", JobSchema);
module.exports = { Job };
