const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const Order = require('../models/order');
const auth = require('../middleware/is-auth');



router.post('/complaint/:orderId',auth.auth,(req,res,next)=>{
    const orderId = req.params.orderId;
    const order = req.params.order;
    const title = req.body.title;
    const message = req.body.message;
    Order.findOne({ order:order })
    .then(order => {
       if (!orderId) {
           const error = new Error('An order with this id could not be found');
           error.statusCode = 401;
           throw error;
       }
       
       const complaint = new Complaint({
           title: title,
           message: message,
           orderId:orderId
       })
       complaint.save();
       order.complaints.push(complaint);
       order.save();
       return res.status(200).json({message:'complaint saved!'});
   })
   .catch(err => {
       if (!err.statusCode) {
           err.statusCode = 500;
       }
       next(err);
   })
})


router.get('/complaints',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Complaint.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Complaint.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(complaints => {
        res.status(200)
          .json({
            message: 'Fetched complaint Successfully',
            complaints: complaints,
            totalItems: totalItems
          });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  
  });


  router.get('/complaint/:complaintId',(req, res, next) => {
    const complaintId = req.params.complaintId;
    Complaint.findById(complaintId)
      .then(complaint => {
        if (!complaint) {
          const error = new Error('Could not find complaint.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'complaint fetched.', complaint: complaint });
      })
      
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });


  router.get('/complaints',auth.auth,(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Complaint.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Complaint.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(complaints => {
        res.status(200)
          .json({
            message: 'Fetched complaint Successfully',
            complaints: complaints,
            totalItems: totalItems
          });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

//   router.get('/average', (req, res) => {
//     Complaint.aggregate([
//     {
//       $group: {
//         _id: "$userId",
//         avgrating: {
//           $avg: "$rating"
//         }
//       }
//     }
//   ])
//     .then(results => {
//         res.send({ rating: results[0].avgrating });
//     })
//     .catch(error => console.error(error))
// });


module.exports = router;