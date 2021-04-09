const express = require('express');
var User = require('../models/user');
const router  =  express();
const QRCode =require('qrcode');


router.get('/qr',(req,res)=>{
    User.find((err,data)=>{
        if(err){
            console.log(err);
        }else{
            if(data!=''){
                var temp =[];
                for(var i=0;i< data.length;i++){
                    var name = {
                        data:data[i].name
                    }
                    temp.push(name);
                    var phone = {
                        data:data[i].phone
                    }
                    temp.push(phone);
                }
                QRCode.toDataURL(temp,{errorCorrectionLevel:'H'},function (err, url) {
                    console.log(url)
                    res.render('home',{data:url})
                });
            }else{
                res.render('home',{data:''});
            }
        }
    });
});


router.post('/qr',(req,res)=>{
    var user = new User({
        name:req.body.name,
        phone:req.body.phone
    });
    user.save((err,data)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
});


module.exports = router;