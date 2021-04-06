const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const otpSchema = new Schema({
    createdAt:{
        type:Date,
        default : Date.now,
    },
    updatedAt:{
        type:Date,
        default : Date.now()
    },
    // expiredAt:{
    //     type:Date,
    //     default : Date.now(),
    //     expires: 3600
    // },
    ot:{
        type: String,
        require: true,  
    },
    creator:{
        type:Schema.Types.ObjectId,
        ref:'User'
        
    }
});
    module.exports = mongoose.model('OTP',otpSchema);