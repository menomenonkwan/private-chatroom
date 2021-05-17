const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemberSchema = new Schema(
  {
    firstname: { type: String, required: true, maxlength: 25 },
    lastname: { type: String, required: true, maxlength: 25 },
    username: { type: String, required: true, minlength: 3, maxlength: 50 },
    password: { type: String, required: true, minlength: 8, maxlength: 64 },
    admin: { type: Boolean },
  }
);

// Virtual for member's URL
MemberSchema
  .virtual('url')
  .get(function() {
    return `/member/${this._id}`;
  });

module.exports = mongoose.model('Member', MemberSchema);