const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  RestaurantName:{
      type:String
  }
},{
  timestamps:true
});


module.exports = mongoose.model('Restaurant', restaurantSchema);