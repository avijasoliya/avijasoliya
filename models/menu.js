const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    categoryId: {
      type:Schema.Types.ObjectId,
      required:true,
      ref:'Category'
    },
    categoryName: {
        type: String,
        // required:true
    },
    name: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    offerPrice:{
      type:Number,
      // required:true
    },
    originalPrice:{
      type:Number
    },
    availability:{
      type:Boolean,
      required:true,
      default:true
    },
    offer:{
      type:Number,
      // required:true,
      default:0
    },
    description: {
      type: String,
      required: true
    },
    feedback:String,
    creator: {
      type: Object,
      // required: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);