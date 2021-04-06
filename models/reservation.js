const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const reservationschema = new Schema({
    phone:{type:Number,required:true},
    name:{type:String,required:true},
    size:{type:Number,required:true},
    time:Date,
    Status:String,
    Table:Number
    });

    module.exports = mongoose.model('Reservation',reservationschema);
