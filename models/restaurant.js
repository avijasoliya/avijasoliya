const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
  
const restoSchema = new Schema({

    name:{type:String,required:true},
    
});

module.exports = mongoose.model('Restaurant',restoSchema);
