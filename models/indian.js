const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const indianSchema = new Schema(
  {
   
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
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Indian', indianSchema);