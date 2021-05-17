const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const PostSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3, maxlength: 50 },
    post: { type: String, required: true, minlength: 3, maxlength: 1000 },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    timestamp: { type: Date, default: Date.now },
  }
);

// Virtual for Timestamp
PostSchema
  .virtual('date_formatted')
  .get(function() {
    return `${DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_FULL)}`;
  });

// Virtual for member's URL
PostSchema
  .virtual('url')
  .get(function() {
    return `/delete/${this._id}`;
  });

module.exports = mongoose.model('Post', PostSchema);