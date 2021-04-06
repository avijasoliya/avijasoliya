const express = require('express');
const router = express.Router();
const Indian = require('../models/indian');
const Subcategory = require('../models/subcategorypost');

const path = require('path');
const fs = require('fs');


router.get('/menues',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Indian.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Indian.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(indians => {
        res.status(200)
          .json({
            message: 'Fetched menu Successfully',
            indians: indians,
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
    const indian = new Indian({
      name: name,
      imageUrl: `http://localhost:8080/${imageUrl}`,

      description: description,
      price:price,    
    });
    Subcategory.findOne({subcategoryName:req.body.subcategoryName})
    .then(subcategory=>{
    if(!subcategory){
      const error = new Error("subcategory not found")
      throw error;
    }
    indian.save();
    loadedsubcategory = subcategory
    subcategory.indians.push(indian);
    return subcategory.save();
    
  }) 
    
    .then(result => {
      res.status(201).json({      
        message: 'Item created successfully!',
        indian: indian,
        
      });
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.get('/get/:indianId',(req, res, next) => {
    const indianId = req.params.indianId;
    Indian.findById(indianId)
      .then(indian => {
        if (!indian) {
          const error = new Error('Could not find indian.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'indian fetched.', indian: indian });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:indianId',(req, res, next) => {
    const indianId = req.params.indianId;
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
    Indian.findById(indianId)
      .then(indian => {
        if (!indian) {
          const error = new Error('Could not find indian.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== indian.imageUrl) {
          clearImage(indian.imageUrl);
        }
        indian.title = title;
        indian.imageUrl = imageUrl;
        indian.content = content;
        return indian.save();
      })
      .then(result => {
        res.status(200).json({ message: 'indian updated!', post: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:indianId', (req, res, next) => {
    const indianId = req.params.indianId;
    let loadedSubcategory

    Indian.findById(indianId)
      .then(indian => {
        if (!indian) {
          const error = new Error('Could not find indian.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(indian.imageUrl);
        return Indian.findByIdAndDelete(indianId);
      })
      return Subcategory.findOne(req.params.subcategoryId)
      
      .then(subcategory=>{    
        loadedSubcategory = subcategory
        subcategory.indians.pull(indianId); 
        Indian.findByIdAndDelete(indianId);
        return subcategory.save();
      }) 
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'indian deleted!!' })
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