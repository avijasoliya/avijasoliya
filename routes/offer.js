const express = require('express');
const router = express.Router();
const DiscountCodes = require('../models/offer')

const cc = require('coupon-code')
const code = cc.generate();

router.post('/discount',(req,res,next) =>{
    const ccode = code;
    const isPercent = req.body.isPercent;
    const amount = req.body.amount;
    const expireDate = req.body.expireDate;
    const isActive = req.body.isActive;
    const newDiscountCode = new DiscountCodes({
        ccode: ccode,
        isPercent: isPercent,
        amount: amount,
        expireDate: expireDate,
        isActive: isActive
    })
    newDiscountCode.save()
    .then(result => {
        res.status(201).json({        
          message: 'category created successfully!',
          offer: newDiscountCode,
        });
    })
    .catch(err => {
        if (!err.statusCode) {
        
        err.statusCode = 500;
        }
        next(err);
    });

})


module.exports = router;