const express = require('express');
const Ingredient = require('../models/ingredients');
const path = require('path');
const fs = require('fs');   
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
  };
const router = express.Router();


router.post('/addingredient', (req,res,next) =>{
    const IngredientName = req.body.IngredientName;
    const description = req.body.description;
    const imageUrl = req.file.path;
    const price = req.body.price;
    let creator;
    const ingredient = new Ingredient({
      IngredientName: IngredientName,
      imageUrl: `http://localhost:8020/${imageUrl}`,
      price:price,
      description: description,
      creator: {name:'Manager'}
    });
    ingredient.save()
    // Ingredient.findOne({IngredientName:IngredientName})
    // .then(ingredient=>{
    //     if(ingredient){
    //         return res.json({message:'Ingredient is already available'});
    //     }
    //     else {
    //         ingredient.save()
    //         return res.status(201).json({message: 'Ingredient added  successfully!', product: ingredient });
    //     }
    // })
    .then(result =>{
      return res.status(201).json({message:'Ingredient added successfully !', ingredient: result})
    })
      .catch(err => {
        if (!err.statusCode) {       
          err.statusCode = 500;
        }
        next(err);
      });
  
});

router.get('/getIngredients',(req, res, next) => {
    const CurrentPage = req.query.page || 1;
    const perPage = 20;
    let totalItems;
    Ingredient.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Ingredient.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(ingredients => {
        res.status(200)
          .json({
            message: 'Fetched ingredients Successfully',
            ingredients: ingredients,
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

router.get('/getIngredient/:ingredientId',(req, res, next) => {
    const ingredientId = req.params.ingredientId;
    Ingredient.findById(ingredientId)
      .then(ingredient => {
        if (!ingredient) {
          const error = new Error('Could not find ingredient.');
          error.statusCode = 404;
          return res.json({message:'could not find it'})
        }
        return res.status(200).json({ message: 'ingredient fetched.', ingredient: ingredient });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.put('/update/:ingredientId',(req, res, next) => {
    const ingredientId = req.params.ingredientId;
    const IngredientName = req.body.IngredientName;
    const description = req.body.description;
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }
    Ingredient.findById(ingredientId)
      .then(ingredient => {
        if (!ingredient) {
          const error = new Error('Could not find specified ingredient.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== ingredient.imageUrl) {
          clearImage(ingredient.imageUrl);
        }
        ingredient.IngredientName = IngredientName;
        ingredient.imageUrl =`http://localhost192:8080/${imageUrl}`;
        ingredient.description = description;
        return ingredient.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Ingredient updated!', post: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

router.delete('/delete/:ingredientId',(req, res, next) => {
    const ingredientId = req.params.ingredientId;
    Ingredient.findById(ingredientId)
      .then(ingredient => {
        if (!ingredient) {
          const error = new Error('Could not find th ingredient.');
          error.statusCode = 404;
          throw error;
        }
        // console.log(product.imageUrl)
        clearImage(ingredient.imageUrl);
        return Ingredient.findByIdAndDelete(ingredientId);
      })
      .then(result => {
        // console.log(result);
        res.status(200).json({ message: 'Product deleted!!', DeletedIngredient : result })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

module.exports = router;