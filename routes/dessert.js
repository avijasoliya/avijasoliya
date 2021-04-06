const express = require('express');
const router = express.Router();
const Dessert = require('../models/dessert');
const Subcategory = require('../models/subcategorypost');
const path = require('path');
const fs = require('fs');


router.get('/menues',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Dessert.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Dessert.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(desserts => {
        res.status(200)
          .json({
            message: 'Fetched menu Successfully',
            desserts: desserts,
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
    const dessert = new Dessert({
      name: name,
      imageUrl: `http://localhost:8080/${imageUrl}`,
      subcategory : Subcategory._id,

      description: description,
      price:price,    
    })
    
    .then(result => {
      res.status(201).json({      
        message: 'Item created successfully!',
        dessert: dessert,
        
      });
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.get('/get/:dessertId',(req, res, next) => {
    const dessertId = req.params.dessertId;
    Dessert.findById(dessertId)
      .then(dessert => {
        if (!dessert) {
          const error = new Error('Could not find dessert.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'dessert fetched.', dessert: dessert });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:dessertId',(req, res, next) => {
    const dessertId = req.params.dessertId;
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
    Dessert.findById(dessertId)
      .then(dessert => {
        if (!dessert) {
          const error = new Error('Could not find dessert.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== dessert.imageUrl) {
          clearImage(dessert.imageUrl);
        }
        dessert.title = title;
        dessert.imageUrl = imageUrl;
        dessert.content = content;
        return dessert.save();
      })
      .then(result => {
        res.status(200).json({ message: 'dessert updated!', post: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:dessertId', (req, res, next) => {
    const dessertId = req.params.dessertId;
    let loadedSubcategory

    Dessert.findById(dessertId)
      .then(dessert => {
        if (!dessert) {
          const error = new Error('Could not find dessert.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(dessert.imageUrl);
        return Dessert.findByIdAndDelete(dessertId);
      })
      return Subcategory.findOne(req.params.subcategoryId)
      
      .then(subcategory=>{    
        loadedSubcategory = subcategory
        subcategory.desserts.pull(dessertId); 
        Dessert.findByIdAndDelete(dessertId);
        return subcategory.save();
      }) 
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'Dessert deleted!!' })
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