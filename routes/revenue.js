const express = require('express');
const router = express.Router();
const Revenue = require('../models/revenue');
const Order = require('../models/order');
const auth = require('../middleware/is-auth');


router.get('/revenuedaily', (req, res) => {
    const todays= req.body.todays;
    
    Order.aggregate([
    
    {$project: {_id:1, day:{$dayOfMonth:"$createdAt"},subTotal:1}},
   {$group: {_id:{day:"$day"}, sum:{$sum:"$subTotal"}}},
   {$match : {"_id.day" : todays    }}
],
function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
})
.catch(error => console.error(error))
});



router.get('/revenuemonthly', (req, res) => {
    const months = req.body.months;
    
    Order.aggregate([
    
    {$project: {_id:1, month:{$month:"$createdAt"},day:{$dayOfMonth:"$createdAt"},subTotal:1}},
   {$group: {_id:{month:"$month"}, sum:{$sum:"$subTotal"}}},
   {$match : {"_id.month" : months    }}
],
function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
})
.catch(error => console.error(error))
});


router.get('/revenueyearly', (req, res) => {
    const years = req.body.years;
    
    Order.aggregate([
    
    {$project: {_id:1, year:{$year:"$createdAt"},month:{$month:"$createdAt"},day:{$dayOfMonth:"$createdAt"},subTotal:1}},
   {$group: {_id:{year:"$year"}, sum:{$sum:"$subTotal"}}},
   {$match : {"_id.year" : years    }}
],
function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
})
.catch(error => console.error(error))
});



router.get('/sum', (req, res) => {
    Order.aggregate([
    {
      $group: {
        _id: "$orderId",
        total: {
          $sum: "$subTotal"
        }
      }
    }
  ])
    .then(results => {
        res.send({ grandtotal: results[0].total });
    })
    .catch(error => console.error(error))
});
module.exports = router;    