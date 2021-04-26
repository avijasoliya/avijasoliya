const express = require('express');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/menu');
const cart = require('../models/cart');
const All = require('../models/all')

const auth = require('../middleware/is-auth');

const router = express.Router();


router.put('/makeorder',auth.auth,(req,res,next) =>{
  const name = req.body.name;
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const paymentMethod = req.body.paymentMethod;  
  let loadedCart;
  var loadedUser;
  All.findOne({email})
  .then(all=>{
    if(!all){
      const error = new Error('There are no such persons!!');
      error.statusCode = 404;
      throw error;
    }
    else{
      loadedUser = all;
      return Cart.findOne({email})
    }
    
  })    
  .then(cart=>{
      if(!cart){
        const error = new Error('Could not find Cart!!');
        error.statusCode = 404;
        throw error;
      }
      loadedCart = cart.items;
      subTotal = cart.subTotal;
      const order = new Order({
        name : name,
        paymentMethod: paymentMethod,
        email:email,
        grandTotal: subTotal,
        userId:id,
        items: loadedCart
    })
    order.save();      
    loadedUser.orders.push(order);
    loadedUser.save();
    // console.log(loadedUser)
    
    
    res.status(200).json({ orderId:order._id, userDetails:order ,Order: loadedCart });
    return Cart.findOneAndDelete({email})
  })
  .then(cart=>{
    cart.remove();
    
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.get('/getorder/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId).populate({path:"items",populate:{
    path: "productId"
  }
})
  .then(order=>{
      if(!order){
          return res.status(404).json({message:"please make an order first :)"})
      }
      return res.status(200).json({message:"The order", order:order})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });

});

router.get('/getorders',(req, res, next) => {
  const CurrentPage = req.query.page || 1;
  const perPage = 20;
  let totalItems;
  Order.find().populate({path:"items",populate:{
    path: "productId"
  }
})
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Order.find().populate({path:"items",populate:{
        path: "productId"
      }
    })
        .skip((CurrentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(orders => {
      res.status(200)
        .json({
          message: 'Fetched orders Successfully',
          orders: orders,
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

router.get('/myorders',auth.auth,(req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  All.findOne({email}).populate({path:"orders",populate:{
    path: "items.productId"
  }
})
  .then(all=>{
    if(!all){
      const error = new Error('THere are no such persons!!');
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({message:"here you go..", data:all})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/receive/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order=>{
      if(!order){
          return res.status(404).json({message:"please make an order first :)"})
      }
      order.OrderIs='In Progress';
      order.save();
      return res.status(200).json({message:"your orders has been received...please wait till we make it ready for you" });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.post('/list', (req,res,next) =>{
  const OrderIs = req.body.OrderIs;

  Order.find({OrderIs})
  .then(orders=>{
    return res.status(200).json({message:'Here is the list you asked for', list:orders})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/cancel/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  const CurrentPage = req.query.page || 1;
  const perPage = 20;
  let totalItems;
  Order.findById(orderId)
  .then(order=>{
      if(!order){
          return res.status(404).json({message:'Please make an order first :)'});
      }
      order.OrderIs = 'Cancelled';
      order.save();
      return Product.find()
  }).then(count => {
      totalItems = count;
      return Product.find()
        .skip((CurrentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(products => {
      return res.status(200).json({message: 'Your order has been cancelled due to the unavailability of the product...can you please make another one :)',products: products})
      })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}


);

router.put('/setdiscount/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  const discount = req.body.discount;
  Order.findById(orderId)
  .then(order=>{
    if(!order){
      return res.status(404).json({message:"There are no such order!!"});
    }
    const offer = (order.grandTotal)/100 * discount;
    order.grandTotal = order.grandTotal - offer ;
    order.save();
    return res.status(200).json({message:"Sorry for the difficulties...here let us help you with your order",order:order});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
})

router.put('/done/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order =>{
    if(!order){
      return res.status(404).json({message:"There are no such orders"});
    }
    else{
      order.OrderIs = "Done";
      order.save();
      return res.status(200).json({message:"Order is done and is on it's way to you."})
    }
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.delete('/delete',(req, res, next) => {
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const orderId = req.params.orderId;
  Order.findOne({ email })
  .then(order=>{
    if(!order){
        return res.status(404).json('Order does not exist')
    }
    order.remove()
  })
  // Order.findById(orderId)
    
    .then(deletedOrder => res.json({ message: "Order dropped ", deletedOrder: deletedOrder }))
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});




module.exports = router;