const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    mincategoryName: {
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
    mincategory:[{
        type:Schema.Types.ObjectId,
        ref:'Mincategory'
      }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);