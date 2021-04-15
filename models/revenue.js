const mongoose = require('mongoose');
const { schema } = require('./all');
const Schema  = mongoose.Schema;

const revenueSchema = new Schema(
    {
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }, 
    grandtotal:{
        type: String,
        // required:true
    },
    subTotal:{  
        type: Number,
        ref:'Order'
    },
    createdAt: {type: Date, default: Date.now},
    today:{
        type: Number,
        ref:'Order'
    }
    

    }
) 

module.exports = mongoose.model('Revenue',revenueSchema)
