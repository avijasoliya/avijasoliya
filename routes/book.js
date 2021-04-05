const express = require('express');
const router  =  express();
const Reservation = require('../models/book');
const Table = require('../models/book');

var newcustomer;

router.post('/reservation',function(req,res){
    Reservation.findOne({phone:req.body.phone}).then(phone=>{
        if (!phone){
                const reservation = new Reservation({
                phone:req.body.phone,
                name:req.body.name,
                size:req.body.size,
                requestedtime:new Date(),
                waitingtime:null,
                checkintime:null,
                checkouttime:null,
                table:req.body.table,
                Status:null
            });
            reservation.save().then(result => { 
                res.status(201).json({
                    message:"created successfully",
                    createdProduct:reservation,
                    phone:req.body.phone,
                    name:req.body.name
                });
                newcustomer = reservation
                sendMessage(reservation,req,res);
            })
            .catch(err => {
                res.status(500).json({error:err});
            })
        }
        else {
            res.status(500).json({error:'Reservation with this Number already exists!!!! Please use a different number'});
        }
    })
});



router.post('/table',function(req,res){
    Table.find({table:req.body.table}).then(result => {
        if(result.length > 0){
            res.status(500).json({message:'Table already reserved'});
        }
        else {
            const  tabledetails  =  new  Table ( {
                table:req.body.table,
                size:req.body.size,
                status:'Available',
                availableTime:null,
                waiting:0
            });
            tabledetails.save().then(result => {  
                res.status(201).json({
                    message:"created successfully",
                    createdProduct:tabledetails
                });
            }).catch(err => {
                res.status(500).json({error:err});
            })
        }
    })
});

      

router.get('/reservations',function(req,res){
    Reservation.find({Status:{'$ne':'Finished'}}).sort({requestedtime:1}).then(result =>{
        if (result.length == 0){
            res.status(500).json({error: 'No Current Reservations'})
        }
        else {
            res.status(200).json({result:result})
        }
    }).catch(err =>{
    })
})




module.exports = router;