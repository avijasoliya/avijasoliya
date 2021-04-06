const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const validator = require('validator')

const userSchema = new Schema({  
    email: {
        type: String,
        required: true,
        match: [/[\w]+?@[\w]+?\.[a-z]{2,4}/, 'The value of path {PATH} ({VALUE}) is not a valid email address.']
      },        
    phone:{
        type: String,
        validate: {
            validator: function(v) {
            return /\d{3}\d{3}\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
    },
    password:{
        type: String,
        required:true,
        
    },
    name:{
        type:String,
        required:true
    },
   
    otps:[{
        type: Schema.Types.ObjectId,
        ref : 'OTP'
        
    }],
    posts:[{
        type: Schema.Types.ObjectId,
        ref:'Post'
        }],
        resetToken:String,
        resetTokenExpiration:Date,
    feedbacks:[{
        type: Schema.Types.ObjectId,
        ref : 'FeedBack'
    }]
},{timestamps: { createdAt: 'created_At', updatedAt: 'updated_At', expireAt:'expired_at' }});


 module.exports = mongoose.model('User',userSchema);