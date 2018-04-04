const mongoose = require("mongoose");

const ActivitySchema = mongoose.Schema({
  title: { type: String, required: false },
  type: { type: String, required: false },
  date: { type: Date, required: false },
  topic: { type: String, required: false },
  website: { type: String, required: false },

  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

ActivitySchema.methods.serialize = function () {
  return {
    id: this._id,
    title: this.title,
    type: this.type,
    date: this.date,
    topic: this.topic,
    website: this.website
  };
};

const Activity = mongoose.model("Activity", ActivitySchema);
module.exports = { Activity };
