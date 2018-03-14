const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  dateDiscovered: { type: Date, required: false },
  jobType: { type: String, required: false },
  companyName: { type: String, required: false },
  companyLocation: { type: String, required: false },
  position: { type: String, required: false },
  salary: { type: Number, required: false },
  companyWebsite: { type: String, required: false },
  companySize: { type: Number, required: false },
  linkJobDescription: { type: String, required: false },
  dateApplied: { type: Date, required: false },
  contactName: { type: String, required: false },
  contactEmail: { type: String, required: false },
  codingChallengeDate: { type: Date, required: false },
  techChallengeDate: { type: Date, required: false },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

JobSchema.methods.serialize = function() {
  return {
    id: this._id,
    dateDiscovered: this.dateDiscovered,
    jobType: this.jobType,
    companyName: this.companyName,
    companyLocation: this.companyLocation,
    position: this.position,
    salary: this.salary,
    companyWebsite: this.companyWebsite,
    companySize: this.companySize,
    linkJobDescription: this.linkJobDescription,
    dateApplied: this.dateApplied,
    contactName: this.contactName,
    contactEmail: this.contactEmail,
    codingChallengeDate: this.codingChallengeDate,
    techChallengeDate: this.techChallengeDate
  };
};

const Job = mongoose.model("Job", JobSchema);
module.exports = { Job };
