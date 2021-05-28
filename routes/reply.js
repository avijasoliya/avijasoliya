const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const Reply = require('../models/reply');
// const auth = require('../middleware/is-auth');
// const All = require('../models/all')

router.post('/reply/:complaintId',(req,res,next)=>{
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
}
  )

  router.get('/replies/:replyId',(req, res, next) => {
    const complaintId = req.params.complaintId;
    const replyId = req.params.replyId;
    let totalItems
    Reply.findById(replyId).populate({path:"replies"}).populate({path:"complaintId"})
      .then(reply => {
        if (!reply) {
          const error = new Error('Could not find reply.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'reply fetched.', reply: reply,totalItems:totalItems });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

  router.get('/reply/:complaintId',(req, res, next) => {
    const complaintId = req.params.complaintId;
    const replyId = req.params.replyId;
    let totalItems
    Complaint.findById(complaintId).populate({path:"complaint"}).populate({path:"replyId"})
      .then(complaint => {
        if (!complaint) {
          const error = new Error('Could not find complaint.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'complaint fetched.', complaint: complaint,totalItems:totalItems });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });



  module.exports = router;