const mongoose    =   require('mongoose');
const Schema  = mongoose.Schema;

const qrSchema  =   new Schema({
    name:{
        type:String
    },
    phno:{
        type:Number
    }
});

module.exports = mongoose.model('Qrcode',qrSchema);