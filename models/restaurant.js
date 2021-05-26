const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  RestaurantName:{
      type:String,
      required:true
  },
  activity:{
    type:Boolean,
    default:true
  },
  ActivatedAt:{
    type:Date
  },
  payment:{
    type:String
  },
  DeactivatedAt:{
    type:Date
  },
  payments:[{
    type:Schema.Types.ObjectId,
    ref:'Payment'
  }],
  expireAt: {
    type: Date,
    default: Date.now()+365*24*60*60000 ,
  },
},{ 
    timestamps: { 
      createdAt: 'created_At', 
      updatedAt: 'updated_At', 
       
    }
  }
);

// const myDB = mongoose.connection.useDb('myDB');

// const UserInfo = myDB.model('userInfo', restaurantInfoSchema);

module.exports = mongoose.model('Restaurant', restaurantSchema);