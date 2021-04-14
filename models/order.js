const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
  },
  
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.']
  },
  price: {
    type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        }
});
const CartSchema = new Schema({
  email: {
    type: String,
    required: true,
    match: [
      /[\w]+?@[\w]+?\.[a-z]{2,4}/,
      'The value of path {PATH} ({VALUE}) is not a valid email address.'
    ]
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

const OrderSchema = new Schema({

    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
    //   required: true,
      match: [
        /[\w]+?@[\w]+?\.[a-z]{2,4}/,
        'The value of path {PATH} ({VALUE}) is not a valid email address.'
      ]
    },
    complaints: [{
      type: Schema.Types.ObjectId,
      ref: 'Complaint'
    }],
  paymentMethod: {
    type: String,
    default: 'cash_on_delivery'
  },
  order: [CartSchema],
  OrderIs:{
    type:String
  },
  OrderHas:{
    type:String
  },

});


OrderSchema.statics = {
  get (id) {
    return this.findById(id)
      .exec()
      .then(order => {
        if (order) {
          return order;
        }
        const err = new Error(
          'No such product exists!',
          
        );
        return Promise.reject(err);
      });
  }
}

  

module.exports = mongoose.model('Order', OrderSchema);