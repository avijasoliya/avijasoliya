const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const path = require('path');
const fs = require('fs');
const { title } = require('process');


router.get('/posts',(req, res, next) => {
  const CurrentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems;
  Post.find()
  .countDocuments()
  .then(count => {
    totalItems = count;
    return Post.find()
    .skip((CurrentPage - 1) * perPage)
    .limit(perPage)
  })
  .then(posts => {
    res.status(200)
    .json({
      message: 'Fetched posts Successfully',
      message1:'hello bro',
      posts: posts,
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

router.post('/post', (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: `http://192.168.29.61:8020/${imageUrl}`,
    creator: {name:'Avi'}
  });
  post
  .save()
  .then(result => {
    res.status(201).json({    
      message: 'post created successfully!',
      title:title,
      post: post,
    });
  })
  .catch(err => {
    if (!err.statusCode) {    
      err.statusCode = 500;
    }
    next(err);
  });
});

router.get('/post/:postId',(req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});

router.put('/post/:postId',(req, res, next) => {
const postId = req.params.postId;
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
Post.findById(postId)
  .then(post => {
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl =`http://192.168.29.61:8020/${imageUrl}`;
    post.content = content;
    return post.save();
  })
  .then(result => {
    res.status(200).json({ message: 'Post updated!', post: result });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
});

router.delete('/post/:postId',(req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
  .then(post => {
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    clearImage(post.imageUrl);
    return Post.findByIdAndDelete(postId);
  })
  .then(result => {
    console.log(result);
    res.status(200).json({ message: 'Post deleted!!' })
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