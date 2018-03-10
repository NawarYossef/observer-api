const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  dateDiscovered: { type: Date, required: false },
  jobType: { type: String, required: false },
  companyName: { type: String, required: false },
  companyLocation: { type: String, required: false },
  Position: { type: String, required: false },
  Salary: { type: Number, required: false },
  companySize: { type: Number, required: false },
  companyWebsite: { type: String, required: false },
  JobDescriptionWebsite: { type: String, required: false },
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

JobSchema.methods.serialize = function() {
  return {
    id: this._id,
    dateDiscovered: this.dateDiscovered,
    jobType: this.jobType,
    companyName: this.companyName,
    companyLocation: this.companyLocation,
    Position: this.Position,
    Salary: this.Salary,
    companySize: this.companySize,
    companyWebsite: this.companyWebsite,
    JobDescriptionWebsite: this.JobDescriptionWebsite
  };
};

const Job = mongoose.model("Job", JobSchema);
module.exports = { Job };
