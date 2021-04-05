const express = require('express');
const router = express.Router();
const manager = require('../models/manager');
const Manager = require('../models/manager');
const { body } =require('express-validator');
const jwt = require('jsonwebtoken');
var otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const OTP = require('../models/otp');
const crypto = require('crypto');
const fs = require('fs');

let refreshTokens = [];

function auth(req,res,next){
  let token = req.headers['authorization']
  token = token.split(' ')[1];

  jwt.verify(token,'someaccesstoken',(err,manager)=>{
    if(!err){
      req.manager = manager;
      next();
    }else{
      return res.status(403).json({message:"manager not authenticated"})
    }
  })
}

router.post("/renewaccessToken",(req,res)=>{
  const refreshToken = req.body.token;
  if(!refreshToken || !refreshTokens.includes(refreshToken)){
    return res.status(403).json("manager not authenticated");
  }
  jwt.verify(refreshToken,"somerefreshtoken",(err,manager)=>{
    if(!err){
      const accessToken= jwt.sign({email:manager.email,managerId: manager._id},'someaccesstoken',{expiresIn:'200s'});
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

router.put('/managersignup',[  
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value)=>{
      return Manager.findOne({email: value}).then(managerDoc=>{ 
        if(managerDoc){
          return Promise.reject('E-mail add already exist.');
        }
      });
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({min:5}),
    body('phone')
    .trim()
    .isMobilePhone()
    .isLength(10),
    body('name')
    .trim()
    .not()
    .isEmpty(),
    ],
    (req, res) => {
      
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const password = req.body.password;

    const manager = new Manager({
    email: email,
    phone:phone,
    password:password,
    name: name,
    });
    return manager.save()
    .then(manager=>{
    res.status(200).json({message:'manager created', managerId: manager._id})
    })
    .catch(()=>{
    const error = new Error('creation failed');
    error.statusCode = 401;
    res.status(500).json({message:'validation failed'})
    throw error;
    })
});

router.post('/managerlogin', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedManager;
    
    Manager.findOne({email: email})
    .then(manager => {
      if (!manager) {
        const error = new Error('A manager with this email not found .');
        error.statusCode = 401;
        throw error;
      }
      var sha512 = crypto.createHash('sha512').update(password).digest('hex').toString();



      loadedManager = manager;
      if(sha512 == manager.password){
        return loadedManager;
      }
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      let accessToken = jwt.sign({email:loadedManager.email ,phone: loadedManager.phone, managerId: loadedManager._id.toString()},'someaccesstoken',{expiresIn:"200s"});
      let refreshToken = jwt.sign({email:loadedManager.email,phone: loadedManager.phone,managerId: loadedManager._id.toString()},'somerefreshtoken',{expiresIn: "7d"})
      refreshTokens.push(refreshToken);
      console.log(refreshTokens);
      res.status(200).json({accessToken:accessToken,
        refreshToken:refreshToken,  managerId: loadedManager._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
})

router.put('/managerforgotP' , (req, res, next) => {
  // const manager = manager.findById({ _id: req.params.managerId });    
  const managerId = req.params.managerId;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, Number: true, alphabets: false });
  const email = req.body.email;
  let creator;
  let loadedManager;
  const ot = new OTP({
      ot: otp,
      creator: manager._id,
      date: new Date()
  });
      Manager.findOne({ email: email })
          .then(manager => {
              if (!manager) {
                  const error = new Error('An manager with this email could not be found');
                  error.statusCode = 401;
                  res.status(401).json({ message: 'An manager with this email could not be found' });
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
              return Manager.findOne({ email: email });
          })
          .then(manager => {
              creator = manager;
              manager.otps.push(ot);
              res.status(200).json({ message: 'your otp:', otp: otp, creator: { _id: creator._id } });
              return manager.save();
          })
          .catch(err => {
              if (!err.statusCode) {
                  err.statusCode = 500;
              }
              next(err);
          })
});
    
router.post('/managerresetP',(req, res, next) => {
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
              return Manager.findOne({ email : email})
          }
      })    
      .then(manager => {
          if(!manager){
              res.status(401).json({ message: 'An manager with this email could not be found' });
          }
          else
          {
            const newPw = req.body.password;
            manager.password = newPw;
            var sha512 = crypto.createHash('sha512').update(newPw).digest('hex').toString();
            manager.password = sha512;
            manager.save();
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