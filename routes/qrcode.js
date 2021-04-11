const express = require('express');
const router  =  express();
const QRCode =require('qrcode');


router.set("view engine","ejs");

router.get("/",(req,res)=>{
    res.render("qr");
})

router.get("/qr",(req,res)=>{
    res.render("qr");
})

router.post('/generator',(req,res)=>{
    var name = req.body.name;
    var phone = req.body.phone;
    var string = (name+phone);
    console.log(string);
    QRCode.toString(string,{type:'terminal'}, function (err, url) {
      if(err) throw err;
     console.log(url);
    })
    res.render("index");
})

module.exports = router;