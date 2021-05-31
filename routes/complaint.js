const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const Order = require('../models/order');
const auth = require('../middleware/is-auth');
const All = require('../models/all')

router.post('/complaint/:orderId',auth.auth,(req,res,next)=>{
  const title = req.body.title;
  const message = req.body.message;
    const orderId = req.params.orderId;
    let loadedAll;
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    All.findById(id)
    .then(all=>{
      // console.log(all);
      loadedAll  = all;
      return  Order.findById(orderId)
    })  
    .then(order => {
       if (!order) {
           const error = new Error('An order with this id could not be found');
           error.statusCode = 401;
           throw error;
       } 
       const complaint = new Complaint({
           title: title,
           message: message,
           orderId:orderId,
           userId:id
       })
       complaint.save();
       order.complaints.push(complaint);
       order.save();
       loadedAll.complaints.push(complaint);
       loadedAll.save();
      //  console.log(loadedAll)
       return res.status(200).json({message:'complaint saved!',complaint:complaint});
   })
   .catch(err => {
       if (!err.statusCode) {
           err.statusCode = 500;
       }
       next(err);
   })
})

router.post('/waiter/complaint/:orderId',auth.auth,(req,res,next)=>{
  const title = req.body.title;
  const message = req.body.message;
    const orderId = req.params.orderId;
    let loadedAll;
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    All.findById(id)
    .then(all=>{
      // console.log(all);
      loadedAll  = all;
      return  Order.findById(orderId)
    })  
    .then(order => {
       if (!orderId) {
           const error = new Error('An order with this id could not be found');
           error.statusCode = 401;
           throw error;
       } 
       const complaint = new Complaint({
           title: title,
           message: message,
           orderId:orderId,
           userId:id
       })
       complaint.save();
       order.complaints.push(complaint);
       order.save();
       loadedAll.complaints.push(complaint);
       loadedAll.save();
      //  console.log(loadedAll)
       return res.status(200).json({message:'Thank you for your complaint!..',complaint:complaint});
   })
   .catch(err => {
       if (!err.statusCode) {
           err.statusCode = 500;
       }
       next(err);
   })
}
)

router.post('/reply/:complaintId',auth.auth,(req,res,next)=>{
  const message = req.body.message;
    const complaintId = req.params.complaintId;
    let loadedAll;
    Complaint.findById(complaintId)
    .then(complaint => {
       if (!complaintId) {
           const error = new Error('An complaint with this id could not be found');
           error.statusCode = 401;
           throw error;
       } 
       const reply = new Reply({
           message: message,
           complaintId:complaintId
       })
       reply.save();
       complaint.replyId.push(reply);
       complaint.status = "Done";
       complaint.save();
       return res.status(200).json({message:'Thank you for your reply!..',reply:reply});
   })
   .catch(err => {
       if (!err.statusCode) {
           err.statusCode = 500;
       }
       next(err);
   })
})


router.get('/complaints', (req, res, next) => {
  // const CurrentPage = req.query.page || 1;
  // const perPage = 10;
  let totalItems;
  Complaint.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      
    })
    Complaint.find().populate({path:"orderId"}).populate({path:"userId"})
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


router.put('/delete/:complaintId',(req,res,next) =>{
  const complaintId = req.params.complaintId;

  Complaint.findById(complaintId)
  .then(complaint =>{
    if(!complaint){
      const error = new Error('There are no such complaints!!!');
      error.statusCode = 404;
      throw error
    }
    else{
      complaint.status = "Done";
      complaint.save();
      return res.json({message:"Deleted!!", complaint:complaint})
    }
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
})

router.get('/complaint/:complaintId',(req, res, next) => {
  const complaintId = req.params.complaintId;
  Complaint.findById(complaintId).populate({path:"userId"}).populate({path:"orderId"})
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


router.get('/complaints/:userId',(req, res, next) => {
  const userId = req.params.userId;
  Complaint.findById(userId)
    .then(complaints => {
      res.status(200).json({ message: 'complaint fetched.', complaints: complaints });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});

module.exports = router;