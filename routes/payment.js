const Payment = require('../models/payment');
const Order = require('../models/order');
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const auth = require('../middleware/is-auth');
const order = require('../models/order');
const razorpay = new Razorpay({
    key_id: 'rzp_test_oKRAilGLJWjSL9',
    key_secret: 'jiwe5kUThoZeYVFLTboF0XH8'
})

// router.post('/payments/:orderId',auth.auth, (req, res,next) => {
//     const orderId = req.params.orderId;
//     Order.findById(orderId)
//       .then(order => {
//         if (!order) {
//           const error = new Error('Could not find Order.');
//           error.statusCode = 404;
//           throw error;
//         }
//       })
//       .then(payment=>{
//           payment =new Payment({
//             amount:order.grandtotal,
//           currency: 'INR',
//           //any unique id
//         })
//         const response =  razorpay.orders.create(payment)
//         res.json({
//           orderId: orderId,
//           currency: response.currency,
//           amount: response.amount
//         })
//       })
//       .catch(err => {
//         if (!err.statusCode) {
//           err.statusCode = 500;
//         }
//         next(err);
//       });
// })
router.post("/capture/:orderId", (req, res,next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order => {
    if (!order) {
      const error = new Error('Could not find Order.');
      error.statusCode = 404;
      throw error;
    }
  })
  .then(async (result) => {
    let output = result;
    let payments = await razorpay.orders.fetchPayments({
      amount: data['amount'],
      currency: data['currency'],
      orderId: String(result.id),
    });
    console.log(payments);
   }).catch((error) => {
        output = data;
   });

})






router.post("/capture/:orderId", (req, res,next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order => {
    if (!order) {
      const error = new Error('Could not find Order.');
      error.statusCode = 404;
      throw error;
    }
  })
  .then(payment=>{
      payment =new Payment({
        amount:order.amount,
        currency: 'INR',
        if (err) {
          return res.status(500).json({
            message: "Something Went Wrong",
          }); 
        }
      })
      const response =  razorpay.orders.create(payment)
      console.log("Status:", response.statusCode);
      console.log("Headers:", JSON.stringify(response.headers));
      console.log("Response:", body);
      res.json({
        orderId: orderId,
        currency: response.currency,
        amount: response.amount
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
    next(err);
  });
});



module.exports = router;