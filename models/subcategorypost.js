const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new Schema(
  {
    categoryName: {
      type: String,
      // required:true
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'

    }]
    ,
    subcategoryName: {
      type: String,
      
    },
    imageUrl: {
      type: String,
      required: true
    },
    
  category:[{
    type:Schema.Types.ObjectId,
    ref:'Category'
  }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subcategory', subcategorySchema);
