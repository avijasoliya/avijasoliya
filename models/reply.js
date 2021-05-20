const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const replySchema = new Schema(
    {
        complaintId: {
            type: Schema.Types.ObjectId,
            ref: 'Complaint'
        },
        title:{
            type:String,
        },
        message:{
            type:String,
            required:true
        },
        
    },{timestamps: { createdAt: 'created_At', updatedAt: 'updated_At', expireAt:'expired_at' }}
)

module.exports = mongoose.model('Reply',replySchema)