const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
    
const tableSchema = new Schema({

    table:{type:Number,required:true},
    size:{type:Number,required:true},
    status:{type:String},
    availableTime:Date,
    QRCode:{type:String}
});

module.exports = mongoose.model('Table',tableSchema);
