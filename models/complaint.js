const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const complaintSchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        },
        title:{
            type:String,
        },
        message:{
            type:String,
            required:true
        },
        user:{
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    }
)

module.exports = mongoose.model('Complaint',complaintSchema)