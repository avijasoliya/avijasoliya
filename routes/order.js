const express = require('express');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/menu');
const cart = require('../models/cart');
const All = require('../models/all')
const Table = require('../models/table')
const auth = require('../middleware/is-auth');
const { AuthTypeCallsList } = require('twilio/lib/rest/api/v2010/account/sip/domain/authTypes/authCallsMapping');

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

router.put('/waiter/makeorder',(req,res,next) =>{
  const email = req.body.email;
  const phone = req.body.phone;
  const name = req.body.name;
  const table = req.body.table;
  const paymentMethod = req.body.paymentMethod;  
  let loadedCart;
  var loadedUser;
  Table.findOne({table})
  .then(table=>{
    if(!table){
      const error = new Error('There are no such table!!');
      error.statusCode = 404;
      throw error;
    }
    else{
      loadedTable = table;
      return Table.findOne({table})
    }
  })
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
        items: loadedCart,
        table: table
    })
    order.save();
    loadedUser.orders.push(order);
    loadedUser.save();    
    loadedTable.orders.push(order);
    loadedTable.save();
    
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

router.put('/parcel/makeorder',auth.auth,(req,res,next) =>{
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
        items: loadedCart,
        orderType:'Parcel'
    })
    order.save();
    loadedUser.orders.push(order);
    loadedUser.save();  
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
})

router.post('/current',auth.auth, (req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  var loadedOrder =[];
  Order.find({email}).populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
  })
  .then(order =>{
    // console.log(order)
    order.forEach(order=>{
      // console.log(order)
      if(order.OrderIs == "Pending" || order.OrderIs == "In Progress" || order.OrderIs == "Done"){
        loadedOrder.push(order);
      }
      // else{
      //   return res.json({message:"Your order must have been delivered to you by now!"})
      // }
    })
    return res.json({message:"Here you go.." , orders:loadedOrder});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
  
});

router.get('/getorder/:orderId', (req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId).populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
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
  Order.find().populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
  })
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Order.find().populate({path:"items",populate:{
        path: "product_id"
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

router.get('/orderlist/:tableId?', (req,res,next) =>{
  const table = req.body.table;
  const tableId = req.params.tableId;
  if(table == undefined){
  Table.findById(tableId).populate({path:"orders",populate:{
      path: "items.product_id"
    }
  })
  .populate({path:"orders",populate:{
    path: "items.categoryId"
  }
  })
  .populate({path:"orders",populate:{
    path: "items.ingredientId"
  }
  })
  .populate("currentUser")
  .then(table=>{
     
    return res.status(200).json({message:'Here is the list you asked for', list:table})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}
else{
  Table.findOne({table}).populate({path:"orders",populate:{
      path: "items.product_id"
    }
  })
  .populate({path:"orders",populate:{
    path: "items.categoryId"
  }
  })
  .populate({path:"orders",populate:{
    path: "items.ingredientId"
  }
  })
  .populate("currentUser")
  .then(table=>{
     
    return res.status(200).json({message:'Here is the list you asked for', list:table})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });

}
});

router.get('/myorders',auth.auth,(req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  All.findOne({email}).populate({path:"orders",populate:{
    path: "items.product_id"
  }
})
.populate({path:"orders",populate:{
  path: "items.categoryId"
}
})
.populate({path:"orders",populate:{
  path: "items.ingredientId"
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

router.put('/receive/:orderId', (req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
  })
  .then(order=>{
      if(!order){
          return res.status(404).json({message:"please make an order first :)"})
      }
      order.OrderIs='In Progress';
      order.OrderReceivedAt = Date.now();
      order.save();
      return res.status(200).json({message:"your orders has been received...please wait till we make it ready for you" , order:order });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.post('/list',  (req,res,next) =>{
  const OrderIs = req.body.OrderIs;
  Order.find({OrderIs}).populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
  })
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
    return res.status(200).json({message:"Sorry for the difficulties...here,let us help you with your order",order:order});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}
)

router.put('/done/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
  })
  .then(order =>{
    if(!order){
      return res.status(404).json({message:"There are no such orders"});
    }
    else{
      order.OrderIs = "Done";
      order.OrderDoneAt = Date.now();
      order.save();
      return res.status(200).json({message:"Order is done and is on it's way to you.", order:order})
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
  .populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
  })
  .then(order=>{
    if(!order){
        return res.status(404).json({message:'Order does not exist'});
    }
    else if(order.OrderIs == "Pending"){
    order.remove()
    }
    else{
      return res.status(500).json({message:'You can not delete this order now!!'});
    }
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

router.get('/bycatid/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  const categoryId = req.params.categoryId;
  var products =[]; 
  Order.findById(orderId)
  .populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  })
  .then(Order=>{
    if(!Order){
      return res.status(404).json({message:"there are no such orders"})
    }    
    products = Order.items;
    // console.log(products)
    const results = products.filter(item => item.categoryId === `${categoryId}`);
    return res.status(200).json({message:"the item you need to make is :" , item: results})
  }) 
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/acceptbycatid/:orderId',auth.auth,(req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const orderId = req.params.orderId;
  const categoryId = req.params.categoryId;
  var products =[]; 
  var loadedCategory;
  All.findOne({email})
  .then(all=>{
    if(!all){
      const error = new Error("There are no such persons!!");
      error.statusCode = 404;
      throw error;
    }
    else{
      loadedCategory = all.categoryId;
      return Order.findById(orderId)
      .populate({
        path: "items.product_id"
      }).populate({
        path: "items.ingredientId"
      })
    }
  })  
  .then(Order=>{
    if(!Order){
      return res.status(404).json({message:"there are no such orders"})
    }    
    products = Order.items;
    const results = products.filter(item => item.categoryId === `${loadedCategory}`);
    results.progress ="In Progress";
    results.itemAcceptedAt = Date.now();
    Order.save();
    return res.status(200).json({message:"the item you accepted to make is :" , item: results})
  }) 
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/donebycatid/:orderId',  (req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const orderId = req.params.orderId;
  const categoryId = req.params.categoryId;
  var loadedCategory;
  var products =[]; 
  All.findOne({email})
  .then(all=>{
    if(!all){
      const error = new Error("There are no such persons!!");
      error.statusCode = 404;
      throw error;
    }
    else{
      loadedCategory = all.categoryId;
      return Order.findById(orderId)
      .populate({
        path: "items.product_id"
      }).populate({
        path: "items.ingredientId"
      })
    }
  })  
  .then(Order=>{
    if(!Order){
      return res.status(404).json({message:"there are no such orders"})
    }    
    products = Order.items;
    const results = products.filter(item => item.categoryId === `${loadedCategory}`);
    results[0].progress ="Done";
    results[0].itemDoneAt = Date.now()
    Order.save();
    return res.status(200).json({message:"Done item :" , item: results})
  }) 
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/cancelbycatid/:orderId',(req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const orderId = req.params.orderId;
  const categoryId = req.params.categoryId;
  var products =[]; 
  let loadedProduct1;
  let loadedProduct;
  var loadedCategory;
  All.findOne({email})
  .then(all=>{
    if(!all){
      const error = new Error("There are no such persons!!");
      error.statusCode = 404;
      throw error;
    }
    else{
      loadedCategory = all.categoryId;
      return Order.findById(orderId)
      .populate({
        path: "items.product_id"
      }).populate({
        path: "items.ingredientId"
      })
    }
  }) 
  .then(Order=>{
    if(!Order){
      return res.status(404).json({message:"there are no such orders"})
    }    
    products = Order.items;
    const results = products.filter(item => item.categoryId === `${loadedCategory}`);
    results[0].progress ="Unavailable";
    loadedProduct1 = results[0].product_id;
    Order.save();
    // res.status(200).json({message:"the item you accepted to make is :" , item: results})
    return Product.findById(loadedProduct1);
  }) 
  .then(product=>{
    if(!product){
      return res.status(404).json({message:'There are no such products'});
    }
    else {
      loadedProduct = product  ;
      loadedProduct.availability = false;
      loadedProduct.save();
      console.log('The process of making an item available has been started....')
      var job = new CronJob('1 * * * * *', function() {
        loadedProduct.availability = true;
        loadedProduct.save();         
        console.log(loadedProduct.availability);
    }, null, true, 'America/Los_Angeles');
    job.start();
    return res.status(200).json({message:"The product you made unavailable is ",product:product})
  }})
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/tokitchen/:orderId/:itemId', (req,res,next) =>{
  const orderId = req.params.orderId;
  const itemId = req.params.itemId;

 Order.updateOne(
    {
      _id: orderId,
      items: {$elemMatch: {'_id':itemId}}
    },
    { $set: { "items.$.ToKitchen" : true } }
 )
 .then(order=>{
  return res.status(200).json({message:"This item has been sent to kitchen "})  
 })
});

router.put('/serve/:orderId',(req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .populate({
    path: "items.product_id"
  }).populate({
    path: "items.ingredientId"
  }).populate({
    path: "items.categoryId"
  })
    .then(order=>{
        if(!order){
            return res.status(404).json({message:"There are no such order"})
        }
        order.OrderIs='Served';
        order.OrderServedAt = Date.now();
        order.save();
        return res.status(200).json({message:"Order has been served" ,order:order});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

});

router.get('/howlong/:orderId', (req,res,next) =>{
  const orderId = req.params.orderId;
  let days;
  let hours;
  let minutes;
  let seconds;
  Order.findById(orderId)
  .then(order=>{
    if(!order){
      return res.status(404).json({message:"There are no such order!"})
    }
    else {
    let Date1 = order.OrderReceivedAt
    let Date2 = order.OrderDoneAt
    let Date3 = order.OrderServedAt
    let res = (Date2 - Date1) / 1000;
    let res1 = (Date3 - Date2) / 1000;
    // var days = Math.floor(res / 86400);  
    // var hours = Math.floor(res / 3600) % 24;
    // var minutes = Math.floor(res / 60) % 60;
    hours = Math.floor(res / 3600) % 24;
    minutes = Math.floor(res / 60) % 60;
    minute = Math.floor(res1 / 60) % 60;
    seconds =Math.floor (res % 60);
    second = Math.floor (res1 % 60);
    }
    return res.status(200).json({message:`The time it took for cook to make the order was${hours} : ${minutes} hours and ${seconds} seconds.......Also it took ${minute} minutes and ${second} seconds for waiter to deliver it.`});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/acceptbycatid/:orderId/:itemId',auth.auth,(req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const orderId = req.params.orderId;
  const itemId = req.params.itemId;
  var date = Date.now();
  Order.updateOne(
    {
      _id: orderId,
      items: {$elemMatch: {'_id':itemId}}
    },
    { $set: { "items.$.progress" : "In Progress" ,"items.$.itemAcceptedAt" : `${date}`} }
 ).then(order=>{
  return res.status(200).json({message:"This item has been accepted!! "})  
 })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/donebycatid/:orderId/:itemId',auth.auth,(req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const orderId = req.params.orderId;
  const itemId = req.params.itemId;
  var date = Date.now();
  Order.updateOne(
    {
      _id: orderId,
      items: {$elemMatch: {'_id':itemId}}
    },
    { $set: { "items.$.progress" : "Done" ,"items.$.itemDoneAt" : `${date}`} }
 ).then(order=>{
  return res.status(200).json({message:"Done!! "})  
 })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.put('/cancelbycatid/:orderId/:itemId',auth.auth,(req,res,next) =>{
  let token = req.headers['authorization'];
  token = token.split(' ')[1];
  const orderId = req.params.orderId;
  const itemId = req.params.itemId;
  var date = Date.now();
  Order.updateOne(
    {
      _id: orderId,
      items: {$elemMatch: {'_id':itemId}}
    },
    { $set: { "items.$.progress" : "Cancelled" } }
 ).then(order=>{
  return res.status(200).json({message:"Cancelled!! "})  
 })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.get('/timeforitem/:orderId/:itemId',(req,res,next) =>{
  const orderId = req.params.orderId;
  const itemId = req.params.itemId;
  var itemAcceptedAt;
  var itemDoneAt;
  Order.findOne({_id:orderId},{items: {$elemMatch: {_id:itemId}}})
  .then(order =>{
    if(!order){
      const error = new Error("There are no such orders!!");
      error.statusCode = 404;
      throw error;
    }
   itemAcceptedAt = order.items[0].itemAcceptedAt;
   itemDoneAt = order.items[0].itemDoneAt;
   result = itemDoneAt - itemAcceptedAt;
   result1 = (result / 60000);
   return res.json({message:"The time it took to make this item was...", time:result1})
  })
});

module.exports = router;