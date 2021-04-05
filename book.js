const mongoose = require('mongoose');
const Schema  = mongoose.Schema;


const reservationschema = new Schema({
    phone:{type:Number,required:true},
    name:{type:String,required:true},
    size:{type:Number,required:true},
    requestedtime:Date,
    waitingtime:String,
    checkintime:Date,
    checkouttime:Date,
    Status:String,
    Table:Number
    });
    
const tableSchema = new Schema({

    table:{type:Number,required:true},
    size:{type:Number,required:true},
    status:{type:String},
    availableTime:Date,
    waiting:Number
});

module.exports = mongoose.model('Reservation',reservationschema);
module.exports = mongoose.model('Table',tableSchema);
