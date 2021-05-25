const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const feedbackSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }, 
        rating:{
            type:Number,
            required:true,
            default: 0,
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
    },{timestamps: { createdAt: 'created_At', updatedAt: 'updated_At', expireAt:'expired_at' }}
)

module.exports = mongoose.model('Feedback',feedbackSchema)