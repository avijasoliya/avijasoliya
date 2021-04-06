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


const OrderSchema = new Schema({
  user: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      match: [
        /[\w]+?@[\w]+?\.[a-z]{2,4}/,
        'The value of path {PATH} ({VALUE}) is not a valid email address.'
      ]
    }
  },
  paymentMethod: {
    type: String,
    default: 'cash_on_delivery'
  },
  grandTotal: {
    type: Number,
    required: true,
    min: [0, 'Price can not be less then 0.']
  },
  items: [ItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
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
  },

  
  list ({ email, sort = 'createdAt', skip = 0, limit = 50 } = {}) {
    let condition = { 'user.email': email };
    return this.find(condition)
      .sort({ [sort]: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};
module.exports = mongoose.model('Order', OrderSchema);