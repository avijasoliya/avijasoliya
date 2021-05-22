const express = require('express');
const router = express.Router();
const DiscountCodes = require('../models/offer')
const Order = require('../models/order')
const cc = require('coupon-code')
const code = cc.generate();
const Product = require('../models/menu')

router.post('/generate',(req,res,next) =>{
    const ccode = code;
    const Percent = req.body.Percent;
    const amount = req.body.amount;
    const expireDate = req.body.expireDate;
    const isActive = req.body.isActive;
    const newDiscountCode = new DiscountCodes({
        ccode: ccode,
        Percent: Percent,
        amount: amount,
        expireDate: expireDate
    })
    newDiscountCode.save()
    .then(result => {
        res.status(201).json({        
          message: 'coupon created successfully!',
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

router.put('/match/:orderId',(req,res,next) =>{
    const orderId = req.params.orderId;
    const ccode = req.body.code;
    let loadedCode;
    const loadedDate = Date.now()

    DiscountCodes.findOne({ccode})
    .then(code=>{
        if(!code){
            const error = new Error('There are no such codes!!');
            error.statusCode = 404;
            throw error;
        }
        else{
            loadedCode = code;
            return Order.findById(orderId)
        }
    })    
    .then(order=>{
        if(!order){
            const error = new Error('There are no such orders!!');
            error.statusCode = 404;
            throw error;
        }
        else{
            if(loadedCode.Percent == null && loadedCode.expireDate >= loadedDate)
            {
               
                order.grandTotal = order.grandTotal - loadedCode.amount;
                order.save();
                return res.json({message:"Coupon applied successfully", result:order})
            }
            else if(loadedCode.amount == null && loadedCode.expireDate >= loadedDate)
            {
                const offer = (order.grandTotal)/100 * loadedCode.Percent;
                order.grandTotal = order.grandTotal - offer ;
                order.save();
                return res.json({message:"Coupon applied successfully", result:order})
            }
            else
            {
                return res.json({message:"Coupon expired!!!"})
            }
        }
    })
    .catch(err => {
        if (!err.statusCode) {        
        err.statusCode = 500;
        }
        next(err);
    });
});

router.get('/codes',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    DiscountCodes.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return DiscountCodes.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(coupons => {
        res.status(200)
          .json({
            message: 'Fetched coupons Successfully',
            coupons: coupons,
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

router.get('/code/:couponId',(req, res, next) => {
    const couponId = req.params.couponId;
    DiscountCodes.findById(couponId)
      .then(code => {
        if (!code) {
          const error = new Error('Could not find product.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Coupon fetched.', coupon: code });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:couponId', (req,res,next) =>{     
    const couponId = req.params.couponId;
    DiscountCodes.findById(couponId)
      .then(code => {
        if (!code) {
          const error = new Error('Could not find Coupon.');
          error.statusCode = 404;
          throw error;
        }

        else{
            code.remove();
            res.status(200).json({ message: 'Coupon deleted!!' ,result: code})
        }
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  
});

router.put('/update/:couponId', (req,res,next) =>{
    const couponId  = req.params.couponId;
    const expireDate = req.body.expireDate;
    
    DiscountCodes.findById(couponId)
    .then(code=>{
        if(!code)
        {
          const error = new Error('Could not find Coupon.');
          error.statusCode = 404;
          throw error
        }
        else{
            code.expireDate = expireDate;
            code.save();
            res.status(200).json({ message: 'Coupon updated!!' ,result: code})
        }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});

router.post('/offer',(req,res,next) =>{
  const offer = req.body.offer;
 
  var loadedProducts =[];
      
  Product.find()
  .then(products =>{
    if(!products)
    {
      const error = new Error('There are no such products!!');
      error.statusCode = 404;
      throw error;
    }
    else{
      loadedProducts = products;
      // console.log(loadedProducts)
      loadedProducts.forEach(product =>{
        product.offer = offer;
        const offers = (product.originalPrice* offer)/100 ;
        const LoadedPrices = product.originalPrice - offers;
        product.offerPrice = LoadedPrices;
        product.save();
      })
    }
            return res.json({message:"Offer has been applied to the entire Restaurant" , products:products})
  }) 
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }); 

});
module.exports = router;