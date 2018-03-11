const mongoose = require("mongoose");

const ActivitySchema = mongoose.Schema({
  date: { type: Date, required: false },
  type: { type: String, required: false },
  name: { type: String, required: false },
  website: { type: String, required: false },
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

ActivitySchema.methods.serialize = function() {
  return {
    id: this._id,
    date: this.date,
    type: this.type,
    name: this.name,
    website: this.website
  };
};

const Activity = mongoose.model("Activity", ActivitySchema);
module.exports = { Activity };
