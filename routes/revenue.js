const express = require('express');
const router = express.Router();
const Revenue = require('../models/revenue');
const Order = require('../models/order');
const auth = require('../middleware/is-auth');


// router.get('/revenuedaily', (req, res) => {
//     const todays= req.body.todays;
    
//     Order.aggregate([
    
//     {$project: {_id:1, day:{$dayOfMonth:"$createdAt"},grandTotal:1}},
//    {$group: {_id:{day:"$day"}, sum:{$sum:"$grandTotal"}}},
//    {$match : {"_id.day" : todays    }}
// ],
// function(err, result) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.json(result);
//     }
// })
// .catch(error => console.error(error))
// });



// router.get('/revenuemonthly', (req, res) => {
//     const months = req.body.months;
    
//     Order.aggregate([
    
//     {$project: {_id:1, month:{$month:"$createdAt"},day:{$dayOfMonth:"$createdAt"},grandTotal:1}},
//    {$group: {_id:{month:"$month"}, sum:{$sum:"$grandTotal"}}},
//    {$match : {"_id.month" : months    }}
// ],
// function(err, result) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.json(result);
//     }
// })
// .catch(error => console.error(error))
// });


// router.get('/revenueyearly', (req, res) => {
//     const years = req.body.years;
    
//     Order.aggregate([
    
//     {$project: {_id:1, year:{$year:"$createdAt"},month:{$month:"$createdAt"},day:{$dayOfMonth:"$createdAt"},grandTotal:1}},
//    {$group: {_id:{year:"$year"}, sum:{$sum:"$grandTotal"}}},
//    {$match : {"_id.year" : years    }}
// ],
// function(err, result) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.json(result);
//     }
// })
// .catch(error => console.error(error))
// });


router.post('/revenuedate', (req, res) => {
  const dates= req.body.dates;
  
  Order.aggregate([
  
  {$project: {_id:1,date:{$dateToString: { format: "%d/%m/%Y", date: "$createdAt"}},grandTotal:1}},
  {$group : 
    {_id:{date:"$date"}, sum:{$sum:"$grandTotal"}}
  },
  {$match : {"_id.date" : dates    }}
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



router.post('/revenuemonth', (req, res) => {
  const dates= req.body.dates;
  Order.aggregate([
  {$project: {_id:1,date:{$dateToString: { format: "%m/%Y", date: "$createdAt"}},grandTotal:1}},
  {$group : 
    {_id:{date:"$date"}, sum:{$sum:"$grandTotal"}}
  },
  {$match : {"_id.date" : dates    }}
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




router.post('/revenueyear', (req, res) => {
  const years= req.body.years;
  
  Order.aggregate([
  
  {$project: {_id:1,date:{$dateToString: { format: "%Y", date: "$createdAt"}},grandTotal:1}},
  {$group : 
    {_id:{date:"$date"}, sum:{$sum:"$grandTotal"}}
  },
  {$match : {"_id.date" : years    }}
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
          $sum: "$grandTotal"
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