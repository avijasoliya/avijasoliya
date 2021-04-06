const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      require:true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Object,
      required: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
