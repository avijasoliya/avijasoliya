const express = require('express');
const router  =  express();
const Reservation = require('../models/reservation');
const Table = require('../models/table');
const QRCode = require('qr-image');
var Jimp = require("jimp");
var fs = require('fs')
var qrCode = require('qrcode-reader');

router.post('/reservation',function(req,res){
    Reservation.findOne({phone:req.body.phone}).then(result=>{
        if (!result){
                const reservation = new Reservation({
                phone:req.body.phone,
                name:req.body.name,
                size:req.body.size,
                time:new Date(),
                table:req.body.table,
                Status:null
            });
            reservation.save()
            .then(result => { 
                res.status(201).json({
                    message:"created successfully",
                    createdTable:reservation,
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


router.set("view engine","ejs");

router.post('/table',function(req,res){
    Table.find({table:req.body.table}).then(result => {
        if(result.length > 0){
            res.status(500).json({message:'Table Exists with same id !!! Please use a different id'});
        }
        else {
            const  tabledetails  =  new  Table ( {
                table:req.body.table,
                size:req.body.size,
                status:'Available',
                availableTime:null,
                waiting:0,
            });
            tabledetails.save()
            .then(result => {
                const tablec =  JSON.stringify(tabledetails)
                
                const qrpng = QRCode.image(tablec, { type: 'png',ec_level: 'H', size: 10, margin: 0  });
                const table = req.body.table;
                qrpng.pipe(require('fs').createWriteStream('./images/'+`${table}`+ '.png'));
                
                const png_string = QRCode.imageSync(tablec, { type: 'png' });
                
                res.status(201).json({
                    message:"created successfully",
                    createdTable:tabledetails,
                    QRCode:'http://192.168.0.61:8020/images/'+`${table}`+ '.png'
                }); 
                tabledetails.QRCode = `http://192.168.0.61:8020/images/`+`${table}`+`.png`
                tabledetails.save();
                res.render("qr");
            }).catch(err => {
                res.status(500).json({error:err});
            })
        }
    })
});


router.delete('/delete/:tableId', (req, res, next) => {
    const tableId = req.params.tableId;
    Table.findById(tableId)
      .then(table => {
        if (!table) {
          const error = new Error('Could not find table.');
          error.statusCode = 404;
          throw error;
        }
        return Table.findByIdAndDelete(tableId);
      })
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'Table deleted!!' })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
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


// router.get('/scan',(req,res,next)=>{
    
    
//     var buffer = fs.readFileSync(__dirname + '11.png');
//     Jimp.read(buffer, function(err, image) {
//         if (err) {
//             console.error(err);
//         }
//         let QRCode = new qrCode();
//         QRCode.callback = function(err, value) {
//             if (err) {
//                 console.error(err);
//             }
//             console.log(value.result);
//         };
//         QRCode.decode(image.bitmap);
//     });
// })


module.exports = router;