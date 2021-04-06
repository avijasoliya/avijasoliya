const express = require('express');
const router = express.Router();
const Subcategory = require('../models/subcategorypost');
const Category = require('../models/categorypost')
const path = require('path');
const fs = require('fs');


router.get('/subcategories',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Subcategory.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Subcategory.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(subcategoryposts => {
        res.status(200)
          .json({
            message: 'Fetched subcategory Successfully',
            subcategoryposts: subcategoryposts,
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

  router.post('/create', (req, res, next) => {
    // const categoryName = req.body.categoryName;
    const subcategoryName = req.body.subcategoryName;
    const imageUrl = req.file.path;
    let loadedCategory;
    const subcategory = new Subcategory({
      subcategoryName: subcategoryName,
      category : Category._id,
      imageUrl: `http://192.168.0.63:8020/${imageUrl}`,
    });

    Category.findOne({categoryName:req.body.categoryName})
    .then(category=>{
    if(!category){
      const error = new Error("category not found")
      throw error;
    }
    subcategory.save();
    loadedCategory = category
    category.subcategories.push(subcategory);
    return category.save();
    
  }) 
  
    .then(result => {
      res.status(201).json({
        
        message: 'subcategory created successfully!',
        subcategory: subcategory
      });
    })
      .catch(err => {
        if (!err.statusCode) {         
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.get('/subcategory/:subcategoryId',(req, res, next) => {
    const subcategoryId = req.params.subcategoryId;
    Subcategory.findById(subcategoryId)
      .then(subcategory => {
        if (!subcategory) {
          const error = new Error('Could not find Subcategory.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Subcategory fetched.', subcategory: subcategory });
      })
      
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:subcategoryId',(req, res, next) => {
    const subcategoryId = req.params.subcategoryId;
    const subcategoryName = req.body.subcategoryName;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }
    Subcategory.findById(subcategoryId)
      .then(subcategory => {
        if (!subcategory) {
          const error = new Error('Could not find post.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== subcategory.imageUrl) {
          clearImage(subcategory.imageUrl);
        }
        subcategory.subcategoryName = subcategoryName;
        subcategory.imageUrl =`http://192.168.0.63:8020/${imageUrl}`;
        return subcategory.save();
      })
      .then(result => {
        res.status(200).json({ message: 'subcategory updated!', subcategorypost: result });
      })
      
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:subcategoryId',async(req, res, next) => {
    const subcategoryId = req.params.subcategoryId;
    let loadedCategory
    Subcategory.findById(subcategoryId)
      .then(subcategory => {
        if (!subcategory) {
          const error = new Error('Could not find post.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(subcategory.imageUrl);
        return Subcategory.findByIdAndDelete(subcategoryId);
      })
      return Category.findOne(req.params.categoryId)
      
      .then(category=>{    
        loadedCategory = category
        category.subcategories.pull(subcategoryId); 
        Subcategory.findByIdAndDelete(subcategoryId);
        return category.save();
      })  
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'subcategory deleted!!' })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
    }
  );

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

module.exports = router;