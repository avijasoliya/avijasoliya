const express = require('express');
const router = express.Router();
const Italian = require('../models/italian');
const path = require('path');
const Subcategory = require('../models/subcategorypost');

const fs = require('fs');


router.get('/menues',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Italian.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Italian.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(italians => {
        res.status(200)
          .json({
            message: 'Fetched menu Successfully',
            italians: italians,
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
    const italian = new Italian({
      name: name,
      imageUrl: `http://localhost:8080/${imageUrl}`,
      subcategory : Subcategory._id,

      description: description,
      price:price,    
    })
   
    
    .then(result => {
      res.status(201).json({      
        message: 'Item created successfully!',
        italian: italian,
        
      });
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.get('/get/:italianId',(req, res, next) => {
    const italianId = req.params.italianId;
    Italian.findById(italianId)
      .then(italian => {
        if (!italian) {
          const error = new Error('Could not find italian.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'italian fetched.', italian: italian });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:italianId',(req, res, next) => {
    const italianId = req.params.italianId;
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
    Italian.findById(italianId)
      .then(italian => {
        if (!italian) {
          const error = new Error('Could not find italian.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== italian.imageUrl) {
          clearImage(italian.imageUrl);
        }
        italian.title = title;
        italian.imageUrl = imageUrl;
        italian.content = content;
        return italian.save();
      })
      .then(result => {
        res.status(200).json({ message: 'italian updated!', post: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:italianId', (req, res, next) => {
    const italianId = req.params.italianId;
    let loadedSubcategory

    Italian.findById(italianId)
      .then(italian => {
        if (!italian) {
          const error = new Error('Could not find italian.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(italian.imageUrl);
        return Italian.findByIdAndDelete(italianId);
      })
      return Subcategory.findOne(req.params.subcategoryId)
      
      .then(subcategory=>{    
        loadedSubcategory = subcategory
        subcategory.italians.pull(italianId); 
        Italian.findByIdAndDelete(italianId);
        return subcategory.save();
      }) 
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'italian deleted!!' })
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