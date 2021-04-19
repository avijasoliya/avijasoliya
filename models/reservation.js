const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const reservationschema = new Schema({
    phone:{type:Number,required:true},
    name:{type:String,required:true},
    requestedtime:Date,
    waitingtime:String,
    checkintime:Date,
    checkouttime:Date,
    Status:String,
    table:Number
    });

    module.exports = mongoose.model('Reservation',reservationschema);
