const express = require('express');
const router = express.Router();
const Southindian = require('../models/southindian');
const path = require('path');
const fs = require('fs');


router.get('/menues',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Southindian.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Southindian.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(southindians => {
        res.status(200)
          .json({
            message: 'Fetched menu Successfully',
            southindians: southindians,
            totalItems: totalItems
          });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.post('/create',  (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const imageUrl = req.file.path;
    const price = req.body.price;
    let loadedSubcategory;
    const southindian = new southindian({
      name: name,
      imageUrl: `http://localhost:8080/${imageUrl}`,
      subcategory : Subcategory._id,

      description: description,
      price:price,    
    });
    Subcategory.findOne({subcategoryName:req.body.subcategoryName})
    .then(subcategory=>{
    if(!subcategory){
      const error = new Error("subcategory not found")
      throw error;
    }
    southindian.save();
    loadedsubcategory = subcategory
    subcategory.southindians.push(southindian);
    return subcategory.save();
    
  }) 
    
    .then(result => {
      res.status(201).json({      
        message: 'Item created successfully!',
        southindian: southindian,
        
      });
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.get('/get/:southindianId',(req, res, next) => {
    const southindianId = req.params.southindianId;
    Southindian.findById(southindianId)
      .then(southindian => {
        if (!southindian) {
          const error = new Error('Could not find southindian.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'southindian fetched.', southindian: southindian });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:southindianId',(req, res, next) => {
    const southindianId = req.params.southindianId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }
    Southindian.findById(southindianId)
      .then(southindian => {
        if (!southindian) {
          const error = new Error('Could not find southindian.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== southindian.imageUrl) {
          clearImage(southindian.imageUrl);
        }
        southindian.title = title;
        southindian.imageUrl = imageUrl;
        southindian.content = content;
        return southindian.save();
      })
      .then(result => {
        res.status(200).json({ message: 'southindian updated!', post: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:southindianId', (req, res, next) => {
    const southindianId = req.params.southindianId;
    let loadedSubcategory

    Southindian.findById(southindianId)
      .then(southindian => {
        if (!southindian) {
          const error = new Error('Could not find southindian.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(southindian.imageUrl);
        return Southindian.findByIdAndDelete(southindianId);
      })
      return Subcategory.findOne(req.params.subcategoryId)
      
      .then(subcategory=>{    
        loadedSubcategory = subcategory
        subcategory.southindians.pull(southindianId); 
        Southindian.findByIdAndDelete(southindianId);
        return subcategory.save();
      }) 
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'Southindian deleted!!' })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

module.exports = router;