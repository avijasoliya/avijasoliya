const express = require('express');
const router = express.Router();
const Chinese = require('../models/chinese');
const Subcategory = require('../models/subcategorypost');
const path = require('path');
const fs = require('fs');


router.get('/menues',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Chinese.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Chinese.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(chineses => {
        res.status(200)
          .json({
            message: 'Fetched chinese Successfully',
            chineses: chineses,
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
    const chinese = new Chinese({
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
    chinese.save();
    loadedsubcategory = subcategory
    subcategory.chineses.push(chinese);
    return subcategory.save();
    
  }) 
    
    .then(result => {
      res.status(201).json({      
        message: 'Item created successfully!',
        chinese: chinese,
        
      });
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.get('/get/:chineseId',(req, res, next) => {
    const chineseId = req.params.chineseId;
    Chinese.findById(chineseId)
      .then(chinese => {
        if (!chinese) {
          const error = new Error('Could not find chinese.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'chinese fetched.', chinese: chinese });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:chineseId',(req, res, next) => {
    const chineseId = req.params.chineseId;
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
    Chinese.findById(chineseId)
      .then(chinese => {
        if (!chinese) {
          const error = new Error('Could not find chinese.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== chinese.imageUrl) {
          clearImage(chinese.imageUrl);
        }
        chinese.title = title;
        chinese.imageUrl = imageUrl;
        chinese.content = content;
        return chinese.save();
      })
      .then(result => {
        res.status(200).json({ message: 'chinese updated!', post: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:chineseId', (req, res, next) => {
    const chineseId = req.params.chineseId;
    let loadedSubcategory

    Chinese.findById(chineseId)
      .then(chinese => {
        if (!chinese) {
          const error = new Error('Could not find chinese.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(chinese.imageUrl);
        return Chinese.findByIdAndDelete(chineseId);
      })
      return Subcategory.findOne(req.params.subcategoryId)
      
      .then(subcategory=>{    
        loadedSubcategory = subcategory
        subcategory.chineses.pull(chineseId); 
        Chinese.findByIdAndDelete(chineseId);
        return subcategory.save();
      }) 
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'chinese deleted!!' })
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