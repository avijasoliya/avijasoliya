const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required:true,
      unique:true
    },
    
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    imageUrl: {
      type: String,
      required: true
    },
    creator: {
      type: Object,
      required: String
    }
  },{ timestamps: true }
);

categorySchema.plugin(uniqueValidator, {message: 'is already taken.'});

module.exports = mongoose.model('Category', categorySchema);
