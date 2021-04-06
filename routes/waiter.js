const express = require('express');
const router = express.Router();
const waiter = require('../models/waiter');
const Waiter = require('../models/waiter');
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

  jwt.verify(token,'someaccesstoken',(err,waiter)=>{
    if(!err){
      req.waiter = waiter;
      next();
    }else{
      return res.status(403).json({message:"waiter not authenticated"})
    }
  })
}

router.post("/renewaccessToken",(req,res)=>{
  const refreshToken = req.body.token;
  if(!refreshToken || !refreshTokens.includes(refreshToken)){
    return res.status(403).json("waiter not authenticated");
  }
  jwt.verify(refreshToken,"somerefreshtoken",(err,waiter)=>{
    if(!err){
      const accessToken= jwt.sign({email:waiter.email,waiterId: waiter._id},'someaccesstoken',{expiresIn:'200s'});
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

router.put('/waitersignup',[  
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value)=>{
      return Waiter.findOne({email: value}).then(waiterDoc=>{ 
        if(waiterDoc){
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

    const waiter = new Waiter({
    email: email,
    phone:phone,
    password:password,
    name: name,
    });
    return waiter.save()
    .then(waiter=>{
    res.status(200).json({message:'waiter created', waiterId: waiter._id})
    })
    .catch(()=>{
    const error = new Error('creation failed');
    error.statusCode = 401;
    res.status(500).json({message:'validation failed'})
    throw error;
    })
});

router.post('/waiterlogin', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedWaiter;
    
    Waiter.findOne({email: email})
    .then(waiter => {
      if (!waiter) {
        const error = new Error('A waiter with this email not found .');
        error.statusCode = 401;
        throw error;
      }
      var sha512 = crypto.createHash('sha512').update(password).digest('hex').toString();



      loadedWaiter = waiter;
      if(sha512 == waiter.password){
        return loadedWaiter;
      }
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      let accessToken = jwt.sign({email:loadedWaiter.email ,phone: loadedWaiter.phone, waiterId: loadedWaiter._id.toString()},'someaccesstoken',{expiresIn:"200s"});
      let refreshToken = jwt.sign({email:loadedWaiter.email,phone: loadedWaiter.phone,waiterId: loadedWaiter._id.toString()},'somerefreshtoken',{expiresIn: "7d"})
      refreshTokens.push(refreshToken);
      console.log(refreshTokens);
      res.status(200).json({accessToken:accessToken,
        refreshToken:refreshToken,  waiterId: loadedWaiter._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
})

router.put('/waiterforgotP' , (req, res, next) => {
  // const waiter = waiter.findById({ _id: req.params.waiterId });    
  const waiterId = req.params.waiterId;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, Number: true, alphabets: false });
  const email = req.body.email;
  let creator;
  let loadedwaiter;
  const ot = new OTP({
      ot: otp,
      creator: waiter._id,
      date: new Date()
  });
      Waiter.findOne({ email: email })
          .then(waiter => {
              if (!waiter) {
                  const error = new Error('An waiter with this email could not be found');
                  error.statusCode = 401;
                  res.status(401).json({ message: 'An waiter with this email could not be found' });
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
              return Waiter.findOne({ email: email });
          })
          .then(waiter => {
              creator = waiter;
              waiter.otps.push(ot);
              res.status(200).json({ message: 'your otp:', otp: otp, creator: { _id: creator._id } });
              return waiter.save();
          })
          .catch(err => {
              if (!err.statusCode) {
                  err.statusCode = 500;
              }
              next(err);
          })
});
    
router.post('/waiterresetP',(req, res, next) => {
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
              return Waiter.findOne({ email : email})
          }
      })    
      .then(waiter => {
          if(!waiter){
              res.status(401).json({ message: 'An waiter with this email could not be found' });
          }
          else
          {
            const newPw = req.body.password;
            waiter.password = newPw;
            var sha512 = crypto.createHash('sha512').update(newPw).digest('hex').toString();
            waiter.password = sha512;
            waiter.save();
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
  
  
router.get('/getwaiters',(req, res, next) => {
  const CurrentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems;
  Waiter.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Waiter.find()
        .skip((CurrentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(waiters => {
      res.status(200)
        .json({
          message: 'Fetched waiters Successfully',
          waiters: waiters,
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



router.get('/getwaiter/:waiterId',(req, res, next) => {
  const waiterId = req.params.waiterId;
  Waiter.findById(waiterId)
    .then(waiter => {
      if (!waiter) {
        const error = new Error('Could not find waiter.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'waiter Found!.', waiter: waiter });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});


module.exports = router;