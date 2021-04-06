const express = require('express');
const router = express.Router();
const Product = require('../models/menu');
const Subcategory = require('../models/subcategorypost');
const path = require('path');
const fs = require('fs');


router.get('/menues',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 10;
    let totalItems;
    Product.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Product.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(products => {
        res.status(200)
          .json({
            message: 'Fetched menu Successfully',
            products: products,
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
    const product = new Product({
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
    product.save();
    loadedsubcategory = subcategory
    subcategory.products.push(product);
    return subcategory.save();
    
  }) 
    
    .then(result => {
      res.status(201).json({      
        message: 'Item created successfully!',
        product: product,
        
      });
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  
  });

router.get('/get/:productId',(req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
      .then(product => {
        if (!product) {
          const error = new Error('Could not find product.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Product fetched.', product: product });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:productId',(req, res, next) => {
    const productId = req.params.productId;
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
    Product.findById(productId)
      .then(product => {
        if (!product) {
          const error = new Error('Could not find product.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== product.imageUrl) {
          clearImage(product.imageUrl);
        }
        product.title = title;
        product.imageUrl = imageUrl;
        product.content = content;
        return product.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Product updated!', post: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:productId', (req, res, next) => {
    const productId = req.params.productId;
    let loadedSubcategory

    Product.findById(productId)
      .then(product => {
        if (!product) {
          const error = new Error('Could not find product.');
          error.statusCode = 404;
          throw error;
        }
        clearImage(product.imageUrl);
        return Product.findByIdAndDelete(productId);
      })
      return Subcategory.findOne(req.params.subcategoryId)
      
      .then(subcategory=>{    
        loadedSubcategory = subcategory
        subcategory.products.pull(productId); 
        Product.findByIdAndDelete(productId);
        return subcategory.save();
      }) 
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'Product deleted!!' })
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