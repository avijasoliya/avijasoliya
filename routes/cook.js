const express = require('express');
const router = express.Router();
const cook = require('../models/cook');
const Cook = require('../models/cook');
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

  jwt.verify(token,'someaccesstoken',(err,cook)=>{
    if(!err){
      req.cook = cook;
      next();
    }else{
      return res.status(403).json({message:"cook not authenticated"})
    }
  })
}

router.post("/renewaccessToken",(req,res)=>{
  const refreshToken = req.body.token;
  if(!refreshToken || !refreshTokens.includes(refreshToken)){
    return res.status(403).json("cook not authenticated");
  }
  jwt.verify(refreshToken,"somerefreshtoken",(err,cook)=>{
    if(!err){
      const accessToken= jwt.sign({email:cook.email,cookId: cook._id},'someaccesstoken',{expiresIn:'200s'});
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

router.put('/cooksignup',[  
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value)=>{
      return Cook.find({value}).then(cookDoc=>{ 
        if(cookDoc){
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

    const cook = new Cook({
    email: email,
    phone:phone,
    password:password,
    name: name,
    });
    return cook.save()
    .then(cook=>{
    res.status(200).json({message:'cook created', cookId: cook._id})
    })
    .catch(()=>{
    const error = new Error('creation failed');
    error.statusCode = 401;
    res.status(500).json({message:'validation failed'})
    throw error;
    })
});

router.post('/cooklogin', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedCook;
    
    Cook.findOne({email: email})
    .then(cook => {
      if (!cook) {
        const error = new Error('A cook with this email not found .');
        error.statusCode = 401;
        throw error;
      }
      var sha512 = crypto.createHash('sha512').update(password).digest('hex').toString();


      loadedCook = cook;
      if(sha512 == cook.password){
        return loadedCook;
      }
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      let accessToken = jwt.sign({email:loadedCook.email ,phone: loadedCook.phone, cookId: loadedCook._id.toString()},'someaccesstoken',{expiresIn:"200s"});
      let refreshToken = jwt.sign({email:loadedCook.email,phone: loadedCook.phone,cookId: loadedCook._id.toString()},'somerefreshtoken',{expiresIn: "7d"})
      refreshTokens.push(refreshToken);
      console.log(refreshTokens);
      res.status(200).json({accessToken:accessToken,
        refreshToken:refreshToken,  cookId: loadedCook._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
})

router.put('/cookforgotP' , (req, res, next) => {
  // const cook = cook.findById({ _id: req.params.cookId });    
  const cookId = req.params.cookId;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, Number: true, alphabets: false });
  const email = req.body.email;
  let creator;
  let loadedcook;
  const ot = new OTP({
      ot: otp,
      creator: cook._id,
      date: new Date()
  });
      Cook.findOne({ email: email })
          .then(cook => {
              if (!cook) {
                  const error = new Error('An cook with this email could not be found');
                  error.statusCode = 401;
                  res.status(401).json({ message: 'An cook with this email could not be found' });
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
              return Cook.findOne({ email: email });
          })
          .then(cook => {
              creator = cook;
              cook.otps.push(ot);
              res.status(200).json({ message: 'your otp:', otp: otp, creator: { _id: creator._id } });
              return cook.save();
          })
          .catch(err => {
              if (!err.statusCode) {
                  err.statusCode = 500;
              }
              next(err);
          })
});
    
router.post('/cookresetP',(req, res, next) => {
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
              return Cook.findOne({ email : email})
          }
      })    
      .then(cook => {
          if(!cook){
              res.status(401).json({ message: 'An cook with this email could not be found' });
          }
          else
          {
            const newPw = req.body.password;
            cook.password = newPw;
            var sha512 = crypto.createHash('sha512').update(newPw).digest('hex').toString();
            cook.password = sha512;
            cook.save();
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
  
  
router.get('/getcook',(req, res, next) => {
  const CurrentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems;
  Cook.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Cook.find()
        .skip((CurrentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(cooks => {
      res.status(200)
        .json({
          message: 'Fetched Cooks Successfully',
          cooks: cooks,
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



router.get('/getcook/:cookId',(req, res, next) => {
  const cookId = req.params.cookId;
  Cook.findById(cookId)
    .then(cook => {
      if (!cook) {
        const error = new Error('Could not find cook.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Cook Found!.', cook: cook });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});



module.exports = router;