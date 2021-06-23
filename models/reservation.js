const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const validator = require('validator')
var uniqueValidator = require('mongoose-unique-validator');

const reservationschema = new Schema({
    phone:{
        type: String,
        unique:true,
        validate: {
            validator: function(v) {
            return /\d{3}\d{3}\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        // required: [traue, 'User phone number required']
    },
    name:{type:String,required:true},
    requestedtime:Date,
    waitingtime:String,
    checkintime:Date,
    checkouttime:Date,
    Status:String,
    table:Number,
    persons:String,
    restaurantId:{type:Schema.Types.ObjectId},
    status:{
        type:String,
        default:"made_by_user"
    }
    });

reservationschema.plugin(uniqueValidator);

module.exports = mongoose.model('Reservation',reservationschema);   