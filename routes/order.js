const Order = require('../models/order');
const Cart = require('../models/cart');
const cart = require('../models/cart')
const Product = require('../models/menu');
const express = require('express');
const router = express.Router();


router.get('/orders', (req, res, next, id)=> {
  Order.get(id)
    .then(order => {
      req.order = order; 
      return next();
    })
    .catch(err => {
      if (!err.statusCode) {    
        err.statusCode = 500;
        return next(err);
      }
    
    });
});


router.post('/create',(req, res, next) =>{

  if (!(Array.isArray(req.body.items) && req.body.items.length)) {
    const err = new Error('No order items included');
    return next(err);
  }
  const orderData = {
    user: req.body.user,
    paymentMethod: req.body.paymentMethod
  };
  orderData.items = req.body.items.map(item => {
    return {
      productId: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      total:item.total
    };
  });
  orderData.grandTotal = req.body.items.reduce((total, item) => {
    return total + item.price * item.qty;
  }, 0);
  const order = new Order(orderData);

  order.save()
    .then(savedOrder => {
      const allProductPromises = savedOrder.items.map(item => {
        return Product.findById(item.productId).then(product => {
          product.quantity = product.quantity - item.qty;
          return product.save();
        });
      });
      Promise.all(allProductPromises)
        .then(data => {
          return Cart.get(savedOrder.user);
        })
        .then(cart => {
          cart.items = [];
          return cart.save();
        })
        .then(data => {
          res.json(savedOrder);
        })
        .catch(err => {
          if (!err.statusCode) {    
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch(err => {
      if (!err.statusCode) {    
        err.statusCode = 500;
      }
      next(err);
    });
});


router.get('/:orderId',(req, res, next) =>{
  return res.json(req.order);
});


router.param('orderId', (req, res, next)=> {
  const { email, sort = 'createdAt', limit = 50, skip = 0 } = req.query;
  if (!email) {
    throw new Error('order email has not been provided!');
  }
  Order.list({ email, sort, limit, skip })
    .then(orders => res.json(orders))
    .catch(e => next(e));
});


module.exports = router;

