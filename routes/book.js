const express = require('express');
const router  =  express();
const Reservation = require('../models/reservation');
const Table = require('../models/table');
const QRCode = require('qr-image');
var Jimp = require("jimp");
var fs = require('fs')
var qrCode = require('qrcode-reader');
const auth = require('../middleware/is-auth');


router.post('/reservation',auth.auth,function(req,res){
    // const restaurantId = req.params.restaurantId;
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    console.log(name);
    Reservation.findOne({phone:req.body.phone}).then(result=>{
        if (!result){
                const reservation = new Reservation({
                phone:phone,
                requestedtime:new Date(),
                waitingtime:null,
                checkintime:null,
                checkouttime:null,
                name:name,
                table:null,
                Status:'Finished',
            });
            reservation.save()
            .then(result => { 
                res.status(201).json({
                    message:"created successfully",
                    createdTable:reservation,
                   
                });
                newcustomer = reservation
                sendMessage(reservation,req,res);
            })
            .catch(err => {
                res.status(500).json(err);
            })
        }
        else {
            res.status(500).json({error:'Reservation with this Number already exists!!!! Please use a different number'});
        }
    })
});


router.set("view engine","ejs");

router.post('/table',function(req,res){
    // const restaurantId = req.params.restaurantId;
    Table.find({table:req.body.table}).then(result => {
        if(result.length > 0){
            res.status(500).json({message:'Table Exists with same id !!! Please use a different id'});
        }
        else {
            const  tabledetails  =  new  Table ( {
                table:req.body.table,
                size:req.body.size,
                Status:'Available',
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
                    QRCode:'http://localhost:8020/images/'+`${table}`+ '.png'
                }); 
                tabledetails.QRCode = `http://localhost:8020/images/`+`${table}`+`.png`
                tabledetails.save();
                res.render("qr");
            }).catch(err => {
                res.status(500).json({error:err});
            })
        }
    })
});



router.get('/tables',(req, res, next) => {
   let totalItems;
    Table.find()      
      .then(tables => {
        res.status(200)
          .json({
            message: 'tables fetched Successfully',
            tables: tables,
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


router.delete('/delete/:tableId', (req, res, next) => {
    // const restaurantId = req.params.restaurantId;

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
    // const restaurantId = req.params.restaurantId;

    Reservation.find({Status:'Finished'}).sort({requestedtime:1}).then(result =>{
        if (result.length == 0){
            res.status(500).json({error: 'No Current Reservations'})
        }
        else {
            res.status(200).json({result:result})
        }
    }).catch(err =>{
    })
})


router.delete('/deleter/:reservationId', (req, res, next) => {
    // const restaurantId = req.params.restaurantId;

    const reservationId = req.params.reservationId;
    Reservation.findById(reservationId)
      .then(reservation => {
        if (!reservation) {
          const error = new Error('Could not find reservation.');
          error.statusCode = 404;
          throw error;
        }
        return Reservation.findByIdAndDelete(reservationId);
      })
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'Reservation deleted!!' })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });     


router.put('/update/:tableId',(req, res, next) => {
const tableId = req.params.tableId;
const table = req.body.table;
const size = req.body.size;

if (!table) {
    const error = new Error('No table found.');
    error.statusCode = 422;
    throw error;
}
Table.findById(tableId)
    .then(tables => {
    if (!table) {
        const error = new Error('Could not find table.');
        error.statusCode = 404;
        throw error;
    }
    tables.table = table;
    tables.size = size;
    return tables.save();
    })
    .then(result => {
    return res.status(200).json({ message: 'table updated!', table: result});
    })
    .catch(err => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
    });
});

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


router.post('/checkin',auth.auth,function(req,res){
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    var buffer = fs.readFileSync('./images' + '/2.png');
    const qr1 = Jimp.read(buffer, function(err, image) {
        if (err) {
            console.error(err);
        }
        let qrcode = new qrCode();
        qrcode.callback = function(err, value) {
            if (err) {
                console.error(err);
            }
            console.log(value.result);
        };
        qrcode.decode(image.bitmap);
    });
    // const restaurantId = req.params.restaurantId;
    // var phone = req.body.phone;
    var table = req.body.table;
    // const table = req.params.table;
    var requestedtime;
    Reservation.find({phone:phone,Status:'Finished'}).count().then(result =>{
        console.log(" result is " + result);
        console.log("result is " + result + " size ");
        if (result) {
            Reservation.find({phone:phone,Status:'Finished'}).then(result =>{
                requestedtime = new Date(result[0].requestedtime);
                console.log("requested time is " +requestedtime);
                console.log("current time is " +new Date().getTime());
                var waiting=  Math.round(((requestedtime.getTime() - new Date().getTime())/3600000)*-60)
                console.log("waiting is " +waiting);
                Table.find({"table":table}).then(result => {
                    if (result.length == 0) {
                        res.status(500).json({error:" Wrong table"});
                    }
                    else {
                        if (result[0].waiting >= 0 && (result[0].Status == 'Checkin' || result[0].Status == 'Available')) {
                            Table.updateOne({table:table},{$set:{waiting:result[0].waiting,Status:'Reserved'}})
                            .then(result =>
                            {
                            }).catch(err =>{ 
                                console.log('error');
                            })
                            Reservation.updateOne({phone:phone,Status:'Finished'},{$set:{checkintime:new Date(),Status:'Checked In',waitingtime:waiting + " minutes"}})
                            .then(result =>
                            {
                                res.status(200).json({
                                    message:"checkedin successfully",
                                });
                            }).catch(err =>{
                                res.status(500).json({error:err});
                            })
                        }   
                        else if (result[0].waiting == 0 && result[0].Status == 'Checkin'){
                            Table.updateOne({table:table},{$set:{Status:'Reserved'}})
                            .then(result =>
                            {
                            }).catch(err =>{ 
                                console.log('error');
                            })
                            Reservation.updateOne({phone:phone,Status:'Finished'},{$set:{checkintime:new Date(),Status:'Checked In',waitingtime:waiting+ " minutes"}})
                            .then(result =>
                            {
                                res.status(200).json({
                                    message:"checkedin successfully",
                                });
                            }).catch(err =>{
                                res.status(500).json({error:err});
                            })
                        }
                        else {
                            res.status(500).json({
                            error:"Table is not available"});
                        }
                    }
                }).catch(err =>{
                })
            }).catch(err =>{
            })
        }
else {
    res.status(500).json({
        error:"Reservation not found"});
}
}).catch(err =>{
})
});


router.post('/scan',(req,res)=>{
var buffer = fs.readFileSync('./images' + '/2.png');
Jimp.read(buffer, function(err, image) {
	if (err) {
		console.error(err);
	}
	let qrcode = new qrCode();
	qrcode.callback = function(err, value) {
		if (err) {
			console.error(err);
		}
		console.log(value.result);
	};
	qrcode.decode(image.bitmap);
});
})


router.post('/checkout',function(req,res){
    const phone = req.body.phone;
    const table = req.body.table;
    var Status;
    var fphone;
    // Reservation.find({table:table,Status:'Checked In'}).sort({requestedtime:1}).then(result=>{
    //     fphone = result[0].phone;
    // })
    // const restaurantId = req.params.restaurantId;

    Reservation.find({phone:phone,Status:'Checked In'}).then(result => {
        console.log(result)
        if(result.length > 0){
            Status = result[0].Status;
            if (result[0].checkintime == null)
            {
                var waiting = Math.round(((new Date().getTime() - result[0].requestedtime)/3600000)*60);
                Reservation.updateOne({'phone':phone,'Status':{'$ne':'Finished'}},{$set:{checkouttime:new Date(), Status:'Finished',waitingtime:waiting + " minutes"}})
                .then(result =>{
                    res.status(500).json("checked out");

                }).catch(err =>{
                    res.status(500).json({error:err});
                })
            }
            else {
                Reservation.updateOne({'phone':phone,'Status':{'$ne':'Finished'}},{$set:{checkouttime:new Date(), Status:'Finished'}})
                .then(result =>{
                    res.status(500).json("checked out");

                }).catch(err =>{
                    res.status(500).json({error:err});
                })
            }
            var ftime=0;
            // var add =0;
            var available;
            if (result[0].checkintime == null && result[0].waitingtime == null){
                ftime = Math.round(90 - (((new Date().getTime() - result[0].requestedtime)/3600000)*60));
            }
            else if (result[0].checkintime == null && result[0].waitingtime != null){
                ftime = 75;
            }
            else {
                ftime =  Math.round(75 - ((new Date().getTime() - result[0].checkintime)/3600000)*60);
            }
            console.log("ftime is " + ftime);
            Table.find({table:table}).then( result=>{
                console.log(" Table is " + result);
                available = result[0].availableTime - 1000 * 60 * (ftime);
                console.log(available);
                if (result[0].waiting > 0 && Status == 'Checked In' || (result[0].Status != 'Reserved' && Status !='Checked In' && fphone==phone && result[0].waiting !=1)){
                    console.log("check in is " + 'First Checked In')
                    Table.updateOne({table:table},{$set:{Status:'Checkin',availableTime:available,waiting:result[0].waiting}})
                    .then(result =>{
                        alertUser(table);
                        thanksUser(phone);
                        res.status(200).json({
                            message:"checkout successfull",
                        });
                    }).catch(err =>{
                        res.status(500).json({error:err});
                    })
                } 
                else if(result[0].waiting == 1 && Status != 'Checked In'){
                    console.log("check in is " + 'last Checked In')
                    Table.updateOne({table:table},{$set:{waiting:result[0].waiting,Status:'Available',availableTime:null}})
                    .then(result =>{
                        thanksUser(phone);
                        res.status(200).json({
                            message:"checkout successfull",
                        });
                    }).catch(err =>{
                        res.status(500).json({error:err});
                    })
                }
                else if(result[0].waiting > 0 && Status != 'Checked In'){
                    console.log("check in is " + 'Checked In')
                    Table.updateOne({table:table},{$set:{waiting:result[0].waiting,availableTime:available}})
                    .then(result =>{
                        thanksUser(phone);
                        res.status(200).json({
                            message:"checkout successfull",
                        });
                    }).catch(err =>{
                        res.status(500).json({error:err});
                    })
                }
                else {
                    Table.updateOne({table:table},{$set:{Status:'Available',availableTime:null}})
                    .then(result =>{
                        thanksUser(phone);
                        res.status(200).json({
                            message:"checkout successfull",
                        });
                    }).catch(err =>{
                        res.status(500).json({error:err});
                    })
                }
                })
        }
        else {
            res.status(500).json({error:"No valid reservation found"});
        }
    })
})




module.exports = router;