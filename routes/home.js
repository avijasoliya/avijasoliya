const express = require('express');
const router = express.Router();
const { body } =require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const user = require('../models/user')
var otpGenerator = require('otp-generator');
const OTP = require('../models/otp');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
let refreshTokens = [];

function auth(req,res,next){
  let token = req.headers['authorization']
  token = token.split(' ')[1];

  jwt.verify(token,'someaccesstoken',(err,user)=>{
    if(!err){
      req.user = user;
      next();
    }else{
      return res.status(403).json({message:"user not authenticated"})
    }
  })
}

router.post("/renewaccessToken",(req,res)=>{
  const refreshToken = req.body.token;
  if(!refreshToken || !refreshTokens.includes(refreshToken)){
    return res.status(403).json("User not authenticated");
  }
  jwt.verify(refreshToken,"somerefreshtoken",(err,user)=>{
    if(!err){
      const accessToken= jwt.sign({email:user.email,userId: user._id},'someaccesstoken',{expiresIn:'2000s'});
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

router.put('/signup',[  
  body('email')
  .isEmail()
  .withMessage('Please enter a valid email')
  .custom((value)=>{
    return User.findOne({email: value}).then(userDoc=>{ 
      if(userDoc){
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
    var sha512 = crypto.createHash('sha512').update(password).digest('hex');

    const user = new User({
      email: email,
      password: sha512,
      phone:phone,
      name: name,
    });
    console.log(sha512)
    return user.save()
    .then(user=>{
      res.status(200).json({message:'user created', userId: user._id})
    })
    .catch(()=>{
      const error = new Error('creation failed');
      error.statusCode = 401;
      res.status(500).json({message:'validation failed'})
      throw error;
    })
}); 

router.post('/login', (req, res, next) => {
const email = req.body.email;
const phone = req.body.phone;
const password = req.body.password;
let loadedUser;

User.findOne({email})
.then(user => {
  if (!user) {
    const error = new Error('A user with this email or phone no. not found .');
    error.statusCode = 401;
    throw error;
  }
  var sha512 = crypto.createHash('sha512').update(password).digest('hex').toString();

  loadedUser = user;
  if(sha512 == user.password){
    return loadedUser;
  }
})
.then(isEqual => {
  if (!isEqual) {
    const error = new Error('Wrong password!');
    error.statusCode = 401;
    throw error;
  }
  let accessToken = jwt.sign({email:loadedUser.email ,phone: loadedUser.phone, userId: loadedUser._id.toString()},'someaccesstoken',{expiresIn:"200s"});
  let refreshToken = jwt.sign({email:loadedUser.email,phone: loadedUser.phone,userId: loadedUser._id.toString()},'somerefreshtoken',{expiresIn: "7d"})
  refreshTokens.push(refreshToken);
  console.log(refreshTokens);
  res.status(200).json({accessToken:accessToken,
    refreshToken:refreshToken,  userId: loadedUser._id.toString() });
})
.catch(err => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
});
})

router.put('/forgotP' , (req, res, next) => {
  // const user = User.findById({ _id: req.params.userId });    
  const userId = req.params.userId;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, Number: true, alphabets: false });
  const email = req.body.email;
  let creator;
  let loadedUser;
  const ot = new OTP({
      ot: otp,
      creator: user._id,
      date: new Date()
  });
      User.findOne({ email: email })
          .then(user => {
              if (!user) {
                  const error = new Error('An user with this email could not be found');
                  error.statusCode = 401;
                  res.status(401).json({ message: 'An user with this email could not be found' });
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
              return User.findOne({ email: email });
          })
          .then(user => {
              creator = user;
              user.otps.push(ot);
              res.status(200).json({ message: 'your otp:', otp: otp, creator: { _id: creator._id } });
              return user.save();
          })
          .catch(err => {
              if (!err.statusCode) {
                  err.statusCode = 500;
              }
              next(err);
          })
});

router.post('/resetP',(req, res, next) => {
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
              return User.findOne({ email : email})
          }
      })    
      .then(user => {
          if(!user){
              res.status(401).json({ message: 'An user with this email could not be found' });
          }
          else
          {
            const newPw = req.body.password;
            user.password = newPw;
            var sha512 = crypto.createHash('sha512').update(newPw).digest('hex').toString();
            user.password = sha512;
            user.save();
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

router.post('/feedback',(req)=>{
  const name = req.body.name;
  User.findOne({name:name})
  .then(() => {

  })
})

module.exports = router;