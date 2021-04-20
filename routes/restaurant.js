const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurant')

router.post('/addresto',(req,res,next) =>{
    const RestaurantName = req.body.RestaurantName;


    const resto = new Restaurant({
        RestaurantName:RestaurantName
    })
    resto.save();
    console.log(resto);
    return res.status(201).json({message:"Restaurant created!" , RestaurantId : resto._id})



});

module.exports = router;