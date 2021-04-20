const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const complaintSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
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