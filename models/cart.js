const mongoose = require('mongoose');

const Schema = mongoose.Schema;
var ItemSchema = new Schema({
  product_id: {
    type:String,
            ref: 'Product',
  },
  productId:{
    type:String,
    ref:'Product'
  },
  ingredientId:{
    type:String,
    ref:'Ingredient'
  },
  categoryId:{
    type:String,
    ref:'Category'
  },
  priority:{
    type:Number,
    required:true
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.']
  },
  productPrice: {
    type: Number,
            required: true,
        },
  ingredientPrice:{
    type:Number
  },
  notes:{
    type:String,
    default: null
  },
  total: {
      type: Number,
      required: true,
        }
});
const CartSchema = new Schema({
  email: {
    type: String,
    // required: true,
    match: [
      /[\w]+?@[\w]+?\.[a-z]{2,4}/,
      'The value of path {PATH} ({VALUE}) is not a valid email address.'
    ]
  },
  phone:{
    type: String,
    required: true,
    validate: {
        validator: function(v) {
        return /\d{3}\d{3}\d{4}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
    },
    // required: [traue, 'User phone number required']
},
  items: [ItemSchema],
  subTotal: {
            default: 0,
            type: Number
        }
 
},{
        timestamps: true
    }
);
CartSchema.statics = {
  get ({ email } = {}) {
    let condition = { email: email };
    return this.findOne(condition).exec();
  }
};
module.exports = mongoose.model('cart', CartSchema);