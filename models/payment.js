const  Schema  = require('mongoose');
const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
name: {
    type: String,
    // required: true,
},
email: {
    type: String,
    // required: true,
    match: [
      /[\w]+?@[\w]+?\.[a-z]{2,4}/,
      'The value of path {PATH} ({VALUE}) is not a valid email address.'
    ]
  },
amount: {
    type: Number,
    // required: true,
},
grandtotal: {
    type: Number,
    // required: true,
    ref:'Order'
},
currency:{
    type: String,
    required:true

},
order:{
    type:Schema.Types.ObjectId,
    ref:'Order'
}

});
module.exports = mongoose.model('Payment',paymentSchema)