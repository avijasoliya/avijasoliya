const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new Schema(
  {
    categoryId: {
      type:Schema.Types.ObjectId,
      required:true,
      ref:'Category'
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    subcategoryName: {
      type: String,
      required:true
    },
    imageUrl: {
      type: String,
      required: true
    },
    category:{
      type:Schema.Types.ObjectId,
      ref:'Category'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subcategory', subcategorySchema);
