const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const feedbackSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        email: {
            type: String,
            required: true,
            match: [/[\w]+?@[\w]+?\.[a-z]{2,4}/, 'The value of path {PATH} ({VALUE}) is not a valid email address.'],
            ref:'User'
        },   
        rating:{
            type:Number,
            required:true,
            min: 1,
            max: 5
        },
        title:{
            type:String,
        },
        message:{
            type:String,
            required:true
        }
    }
)

module.exports = mongoose.model('Feedback',feedbackSchema)