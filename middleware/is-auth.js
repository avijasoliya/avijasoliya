const jwt = require('jsonwebtoken');
const express = require('express');

exports.auth = (req,res,next)=>{
    let token = req.headers['authorization'];
  try { 
    token = token.split(' ')[1];     
    if(!token){
        const error = new Error('Token is not found ')
        error.statusCode  = 404;
        next(err);
    }
    jwt.verify(token , 'somesupersecretaccesstoken',(err,user)=>{
        if(!err){
            req.user = user;
            email = user.email;
            id = user.Id;
            phone = user.phone;
            name = user.name;
            // console.log(user);
            // console.log(email);
            // user.email = email;
            // console.log(email);
            // req.userId = user.id;
            // req.userEmail = user.email;
            next();
        }
        else{
            return res.status(403).json({message:'User is not authenticated'});
        }
    })
    }
    catch(err){
        return res.status(500).json({message:'Get Token First!!'})
    }
}