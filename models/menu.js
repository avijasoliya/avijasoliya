const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    subcategoryName: {
        type: String,
        // required:true
      },
      indians: [{
        type: Schema.Types.ObjectId,
        ref: 'Indian'
  
      }],
      italians: [{
        type: Schema.Types.ObjectId,
        ref: 'Italian'
  
      }],
      deserts: [{
        type: Schema.Types.ObjectId,
        ref: 'Desert'
  
      }],
      chineses: [{
        type: Schema.Types.ObjectId,
        ref: 'Chinese'
  
      }],
      southindians: [{
        type: Schema.Types.ObjectId,
        ref: 'Southindian'
  
      }],
      
      
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