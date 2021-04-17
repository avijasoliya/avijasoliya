const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
    
const tableSchema = new Schema({

    table:{type:Number,required:true},
    size:{type:Number,required:true},
    Status:{type:String},
    availableTime:Date,
    QRCode:{type:String},
    waiting: {type:Number,default:0}
});

module.exports = mongoose.model('Table',tableSchema);
