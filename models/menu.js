const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    subcategoryId: {
      type:Schema.Types.ObjectId,
      required:true,
      ref:'Subcategory'
    },
    subcategoryName: {
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
    subcategory:[{
        type:Schema.Types.ObjectId,
        ref:'Subcategory'
      }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);