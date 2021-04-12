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
    price:{
      type:Number,
      required:true
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
    category:[{
        type:Schema.Types.ObjectId,
        ref:'Category'
      }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);