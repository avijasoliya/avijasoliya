const express = require('express');
const admin = require('../models/admin');
const router = express.Router();
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
var otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const OTP = require('../models/otp');
const crypto = require('crypto');
const Post = require('../models/post');
const path = require('path');
const fs = require('fs');

let refreshTokens = [];

function auth(req,res,next){
  let token = req.headers['authorization']
  token = token.split(' ')[1];

  jwt.verify(token,'someaccesstoken',(err,admin)=>{
    if(!err){
      req.admin = admin;
      next();
    }else{
      return res.status(403).json({message:"admin not authenticated"})
    }
  })
}

router.post("/renewaccessToken",(req,res)=>{
  const refreshToken = req.body.token;
  if(!refreshToken || !refreshTokens.includes(refreshToken)){
    return res.status(403).json("admin not authenticated");
  }
  jwt.verify(refreshToken,"somerefreshtoken",(err,admin)=>{
    if(!err){
      const accessToken= jwt.sign({email:admin.email,adminId: admin._id},'someaccesstoken',{expiresIn:'200s'});
      return res.status(201).json({accessToken})
    }
    else{
      return res.status(403).json({message:"refresh token not found"})
    }
  })
})

router.post('/protected',auth,(req,res)=>{
  res.status(201).json({message:"Inside protected route"})
});

const transporter = nodemailer.createTransport({ 
  service: 'gmail', 
  auth: { 
      user: 'testkmsof@gmail.com', 
      pass:'Test@2015'
  } 
});

router.post('/adminlogin', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedAdmin;
    
    Admin.findOne({email: email})
    .then(admin => {
      if (!admin) {
        const error = new Error('A admin with this email not found .');
        error.statusCode = 401;
        throw error;
      }
      var sha512 = crypto.createHash('sha512').update(password).digest('hex').toString();

    
      loadedAdmin = admin;
      if(sha512 == admin.password){
        return loadedAdmin;
      }
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      let accessToken = jwt.sign({email:loadedAdmin.email ,phone: loadedAdmin.phone, adminId: loadedAdmin._id.toString()},'someaccesstoken',{expiresIn:"200s"});
      let refreshToken = jwt.sign({email:loadedAdmin.email,phone: loadedAdmin.phone,adminId: loadedAdmin._id.toString()},'somerefreshtoken',{expiresIn: "7d"})
      refreshTokens.push(refreshToken);
      console.log(refreshTokens);
      res.status(200).json({accessToken:accessToken,
        refreshToken:refreshToken,  adminId: loadedAdmin._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
})

router.put('/adminforgotP' , (req, res, next) => {
  // const admin = admin.findById({ _id: req.params.adminId });    
  const adminId = req.params.adminId;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, Number: true, alphabets: false });
  const email = req.body.email;
  let creator;
  let loadedAdmin;
  const ot = new OTP({
      ot: otp,
      creator: Admin._id,
      date: new Date()
  });
      Admin.findOne({ email: email })
          .then(admin => {
              if (!admin) {
                  const error = new Error('An admin with this email could not be found');
                  error.statusCode = 401;
                  res.status(401).json({ message: 'An admin with this email could not be found' });
              }
            else{  transporter.sendMail({
                  to: email,
                  from: 'hello-here.com',
                  subject: 'Forgot Password!!!',
                  html: ` <p>Your OTP  ${otp}</p>
              <p>For password reset click</p>      
              <a href = http://localhost:8020/home/reset/ here>here</a></p>`
              })
          }
              ot.save();
              return Admin.findOne({ email: email });
          })
          .then(admin => {
              creator = admin;
              admin.otps.push(ot);
              res.status(200).json({ message: 'your otp:', otp: otp, creator: { _id: creator._id } });
              return admin.save();
          })
          .catch(err => {
              if (!err.statusCode) {
                  err.statusCode = 500;
              }
              next(err);
          })
});
    
router.post('/adminresetP',(req, res, next) => {
  const email = req.body.email;
  const otp1 = req.body.otp1;
  OTP.findOne({ ot: otp1 })
      .then(ot => {
          if (!ot) {
              const error = new Error('An otp could not be found');
              error.statusCode = 404;
              res.json({ message: "An otp could not be found" });
          }
          else{
              return admin.findOne({ email : email})
          }
      })    
      .then(admin => {
          if(!admin){
              res.status(401).json({ message: 'An admin with this email could not be found' });
          }
          else
          {
            const newPw = req.body.password;
            admin.password = newPw;
            var sha512 = crypto.createHash('sha512').update(newPw).digest('hex').toString();
            admin.password = sha512;
            admin.save();
            res.status(200).json({message:'password updated!!'});
            return OTP.findOne({ ot: otp1 })  
          }                  
      })          
      .then(ot => {
          ot.ot = "";
          ot.save();
      })
      .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      })
})
    

  
module.exports = router;