const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const Product = require('../models/menu');
const auth = require('../middleware/is-auth');



router.post('/complaint/:productId',auth.auth,(req,res,next)=>{

    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    const productId = req.params.productId;
    const product = req.params.product;
    const title = req.body.title;
    const message = req.body.message;
    Product.findById(productId)
    .then(product => {
       if (!productId) {
           const error = new Error('An product with this id could not be found');
           error.statusCode = 401;
           throw error;
       }
       console.log(product)
       const complaint = new Complaint({
           title: title,
           message: message,
           productId:productId,
           user: id
       })
       complaint.save();
       product.complaints.push(complaint);
       product.save();
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


  // router.get('/complaints',auth.auth,(req, res, next) => {
  //   const CurrentPage = req.query.page || 1;
  //   const perPage = 10;
  //   let totalItems;
  //   Complaint.find()
  //     .countDocuments()
  //     .then(count => {
  //       totalItems = count;
  //       return Complaint.find()
  //         .skip((CurrentPage - 1) * perPage)
  //         .limit(perPage)
  //     })
  //     .then(complaints => {
  //       res.status(200)
  //         .json({
  //           message: 'Fetched complaint Successfully',
  //           complaints: complaints,
  //           totalItems: totalItems
  //         });
  //     })
  //     .catch(err => {
  //       if (!err.statusCode) {
  //         err.statusCode = 500;
  //       }
  //       next(err);
  //     });
  
  // });

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