const express = require('express');
const router = express.Router();
const Product = require('../models/menu');
const Category = require('../models/categorypost');
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



  router.post('/create/:categoryId',(req, res, next) => {
    const categoryId = req.params.categoryId;
    const name = req.body.name;
    const description = req.body.description;
    const imageUrl = req.file.path;
    let loadedcategory;
    const price = req.body.price;
      
      Category.findById(req.params.categoryId)
      .then(category=>{
        if(!category){
          const error = new Error("product not found")
          throw error;
        }
        const product = new Product({
          categoryId : categoryId,
          name:name,
          description:description,
          price:price,
          imageUrl: `http://192.168.0.61:8020/${imageUrl}`,
        })
        product.save()
        loadedCategory = category
        category.products.push(product)
        return category.save();
      })
      .then(result => {
        res.status(201).json({      
            message: 'category created successfully!',
          product: product
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
    let imageUrl = req.body.imageUrl;
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
      return Category.findOne(req.params.categoryId)
      
      .then(category=>{    
        loadedCategory = category
        category.products.pull(productId); 
        Product.findByIdAndDelete(productId);
        return category.save();
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
  const categoryName = req.body.categoryName;
    Product.find({categoryName:categoryName})
    .then(name=>{
      if(!name) {
        const error = new Error('Could not find category.');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({
        message: 'Fetched category Successfully',
        products: name,
        
        
      })
    })
    
})


  router.get('/menu/:categoryId', async (req, res, next)=> {
    const categoryId = req.params.categoryId;
    const name = req.params.name;
    let loadedProduct;
    loadedProduct = categoryId;
    Product.find({categoryId})
    .then(product => {
      if (!product) {
        const error = new Error('Could not find category.');
        error.statusCode = 404;
        throw error;
      }
      // console.log(category)
      res.status(200).json({ message: 'Category fetched.', product: product  });
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