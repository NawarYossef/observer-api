const mongoose = require("mongoose");

const ContactSchema = mongoose.Schema({
  name: { type: String, required: true },
  contactTitle: { type: String, required: false },
  email: { type: String, required: false },
  companyName: { type: String, required: false },
  notes: { type: String, required: false }

  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

ContactSchema.methods.serialize = function () {
  return {
    id: this._id,
    name: this.name,
    contactTitle: this.contactTitle,
    email: this.email,
    companyName: this.companyName,
    notes: this.notes,
  }
};

const Contact = mongoose.model("Contact", ContactSchema);
module.exports = { Contact };
