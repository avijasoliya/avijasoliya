const express = require('express');
const router  =  express();
const MongoClient = require('mongoose');
const Restaurant = require('../models/restaurant')


router.post('/createres',(req,res)=>{
    const name = req.body.name;
    const url = 'mongodb://localhost:27017';
MongoClient.connect(url).then((client) => {
  
    console.log('Database created');
      
    // database name
    const db = client.db(name);
      
    // collection name
    db.createCollection(name + 'collection');
})
  })


  module.exports = router;