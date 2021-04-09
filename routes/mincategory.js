const express = require('express');
const Mincategory = require('../models/mincategory');
const Category = require('../models/categorypost')
const path = require('path');
const fs = require('fs');
const mincategory = require('../models/mincategory');
const router = express.Router();

router.get('/subcategories',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Mincategory.find()
      .countDocuments()
       .then(count => {
        totalItems = count;
        return Mincategory.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(mincategory => {
        res.status(200)
          .json({
            message: 'Fetched mincategory Successfully',
            mincategory: mincategory,
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

router.post('/create/:categoryId',(req, res, next) => {
    const mincategoryName = req.body.mincategoryName;
    const imageUrl = req.file.  path;
    const categoryName = req.body.categoryName;
    const categoryId = req.params.categoryId;
    let loadedCategory
    const mincategory = new Mincategory({
      mincategoryName: mincategoryName,
      imageUrl: `http://192.168.0.61:8020/${imageUrl}`,
      categoryId:categoryId, 
      category : Category._id,
    })
    Category.findOne({categoryId:req.params.categoryId})
    .then(category=>{
      if(!categoryId){
        const error = new Error("category not found")
        throw error;
      }
      mincategory.save()
      category = loadedCategory
      loadedCategory.mincategories.push(mincategory)
      return category.save();
    })
    
    .then(result => {
      res.status(201).json({      
        message: 'mincategory created successfully!',
        mincategory: mincategory,
        categoryId:categoryId      
      });
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  });



router.get('/mincategory/:mincategoryId',(req, res, next) => {
    const mincategoryId = req.params.mincategoryId;
    Mincategory.findById(mincategoryId)
      .then(mincategory => {
        if (!mincategory) {
          const error = new Error('Could not find mincategory.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Mincategory fetched.', mincategory: mincategory });
      })
      
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });


  
router.put('/update/:mincategoryId',(req, res, next) => {
    const mincategoryId = req.params.mincategoryId;
    const mincategoryName = req.body.mincategoryName;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }
    Mincategory.findById(mincategoryId)
      .then(mincategory => {
        if (!mincategory) {
          const error = new Error('Could not find post.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== mincategory.imageUrl) {
          clearImage(mincategory.imageUrl);
        }
        mincategory.mincategoryName = mincategoryName;
        mincategory.imageUrl =`http://192.168.0.61:8020/${imageUrl}`;
        return mincategory.save();
      })
      .then(result => {
        res.status(200).json({ message: 'mincategory updated!', mincategorypost: result });
      })
      
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:mincategoryId',async(req, res, next) => {
    const mincategoryId = req.params.mincategoryId;
    let loadedCategory
    Mincategory.findById(mincategoryId)
      .then(mincategory => {
        if (!mincategory) {
          const error = new Error('Could not find post.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(mincategory.imageUrl);
        return Mincategory.findByIdAndDelete(mincategoryId);
      })
      return Category.findOne(req.params.categoryId)
      
      .then(category=>{    
        loadedCategory = category
        category.mincategories.pull(mincategoryId); 
        Mincategory.findByIdAndDelete(mincategoryId);
        return category.save();
      })  
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'mincategory deleted!!' })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
    }
  );


  router.get('/mincategories/:categoryId', async (req, res, next)=> {
    const categoryId = req.params.categoryId;
    Mincategory.find({categoryId:categoryId})
    .then(mincategory=>{
      if (!mincategory) {
        const error = new Error('Could not find mincategory.');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({
        message: 'Fetched product Successfully',
        mincategory: mincategory,
        
        
      })
    })
    
})


const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};


module.exports = router;