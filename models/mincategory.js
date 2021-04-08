const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mincategorySchema = new Schema(
  {
    categoryName: {
      type: String,
      // required:true
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    mincategoryName: {
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

module.exports = mongoose.model('Mincategory', mincategorySchema);
