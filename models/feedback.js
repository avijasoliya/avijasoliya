const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const feedbackSchema = new Schema(
    {
        title:{
            typr:String
        },
        message:{
            type:String
        }
    }
)

module.exports = mongoose.model('Feedback',feedbackSchema)