const express = require('express');
const router = express.Router();
const FeedBack = require('../models/feedback');
const User = require('../models/user');

router.post('/feedback/:userId',(req,res,next)=>{
    const rating = req.body.rating;
    const user = req.params.user;
    const title = req.body.title;
    const message = req.body.message;
    User.findOne({ user:user })
    .then(user => {
       if (!user) {
           const error = new Error('An user with this id could not be found');
           error.statusCode = 401;
           throw error;
       }
       const feedback = new FeedBack({
           rating : rating,
           title: title,
           message: message
       })
       
       feedback.save();
       user.feedbacks.push(feedback);
       user.save();
       return res.status(200).json({message:'Feedback saved!'});
   })
   .catch(err => {
       if (!err.statusCode) {
           err.statusCode = 500;
       }
       next(err);
   })
})


router.get('/feedbacks',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    FeedBack.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return FeedBack.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(feedbacks => {
        res.status(200)
          .json({
            message: 'Fetched feedback Successfully',
            feedbacks: feedbacks,
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


  router.get('/feedback/:feedbackId',(req, res, next) => {
    const feedbackId = req.params.feedbackId;
    FeedBack.findById(feedbackId)
      .then(feedback => {
        if (!feedback) {
          const error = new Error('Could not find feedback.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'feedback fetched.', feedback: feedback });
      })
      
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });



module.exports = router;