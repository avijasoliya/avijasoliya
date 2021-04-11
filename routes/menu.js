const express = require('express');
const router = express.Router();
const Product = require('../models/menu');
const Subcategory = require('../models/subcategory');
const product = require('../models/menu')
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



  router.post('/create/:subcategoryId',(req, res, next) => {
    const subcategoryId = req.params.subcategoryId;
    const name = req.body.name;
    const description = req.body.description;
    const imageUrl = req.file.path;
    let loadedsubcategory;
    const price = req.body.price;
      
      Subcategory.findById(req.params.subcategoryId)
      .then(subcategory=>{
        if(!subcategory){
          const error = new Error("product not found")
          throw error;
        }
        const product = new Product({
          subcategoryId : subcategoryId,
          name:name,
          description:description,
          price:price,
          imageUrl: `http://192.168.0.61:8020/${imageUrl}`,
        })
        product.save()
        loadedSubcategory = subcategory
        subcategory.products.push(product)
        return subcategory.save();
      })
      .then(result => {
        res.status(201).json({      
          message: 'subcategory created successfully!',
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
        product.imageUrl = `http://localhost:8020/${imageUrl}`;
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

router.get('/menu/name', async (req, res, next)=> {
  const subcategoryName = req.body.subcategoryName;
    Product.find({subcategoryName:subcategoryName})
    .then(name=>{
      if(!name) {
        const error = new Error('Could not find subcategory.');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({
        message: 'Fetched subcategory Successfully',
        products: name,
        
        
      })
    })
    
})


  router.get('/menu/:subcategoryId', async (req, res, next)=> {
    const subcategoryId = req.params.subcategoryId;
    const name = req.params.name;
    let loadedProduct;
    loadedProduct = subcategoryId;
    Product.find({subcategoryId})
    .then(product => {
      if (!product) {
        const error = new Error('Could not find subcategory.');
        error.statusCode = 404;
        throw error;
      }
      // console.log(subcategory)
      res.status(200).json({ message: 'Subcategory fetched.', product: product  });
    })    
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });    
})


const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

module.exports = router;