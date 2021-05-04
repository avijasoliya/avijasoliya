const express = require('express');
const router = express.Router();
var All = require('../models/all');
const auth = require('../middleware/is-auth');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const OTP = require('../models/otp');
const jwt = require('jsonwebtoken');
const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, Number: true, alphabets: false });
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testkmsof@gmail.com',
        pass: 'Test@2015'
    }
});
let accessTokens = [];



router.put('/register',(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation Failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const phone = req.body.phone;
    const name = req.body.name;
    const password = req.body.password;
    const activerole = req.body.activerole;
    const roles = req.body.roles;
    const sha1 = crypto.createHash('sha1').update(password).digest('hex');
    const all = new All({
        name: name,
        email: email,
        phone: phone,
        activerole: activerole,
        password: sha1        
    })
    console.log(all);
    return all.save()
        .then(all => {
            res.status(201).json({ message: 'Registered sucessfully', Id: all._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
                return res.status(500).json({message:"mmm...somthing seems wrong here!!  you sure,you added the right credentials?"})
            }
            next(err);
        })
});

router.post('/login',(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedAll;
    let loadedActiverole;

    All.findOne({  email: email  })
        .then(all => {
            if (!all) {
                const error = new Error('mmm...somthing seems wrong here!!  you sure,you added the right credentials?');
                error.statusCode = 401;
                throw error;
            }
            else if (all.activerole == 'user'){
                loadedAll = all;
                loadedActiverole = all.activerole;
                var sha1 = crypto.createHash('sha1').update(password).digest('hex');
                let accessToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretaccesstoken', { expiresIn: "86400s" });
                let refreshToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretrefreshtoken', { expiresIn: "7d" })            
                
                if (sha1 == all.password) {
                    accessTokens.push(accessToken);
                    console.log(accessTokens);
                    res.status(200).json({message:'Welcome User',role:loadedActiverole, your_accessToken: accessToken,your_refreshToken: refreshToken, Id: loadedAll._id.toString()});
                    return loadedAll;
            }}
            else if (all.activerole == 'cook'){
                loadedAll = all;
                loadedActiverole = all.activerole;
                var sha1 = crypto.createHash('sha1').update(password).digest('hex');
                let accessToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretaccesstoken', { expiresIn: "86400s" });
                let refreshToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretrefreshtoken', { expiresIn: "7d" })            
                
                if (sha1 == all.password) {
                    accessTokens.push(accessToken);
                    console.log(accessTokens);
                    res.status(200).json({message:'Welcome Cook',role:loadedActiverole, your_accessToken: accessToken,your_refreshToken: refreshToken, Id: loadedAll._id.toString()});
                    return loadedAll;
            }}
            else if (all.activerole == 'waiter'){
                loadedAll = all;
                loadedActiverole = all.activerole;
                var sha1 = crypto.createHash('sha1').update(password).digest('hex');
                let accessToken = jwt.sign({ email: loadedAll.email, name:loadedAll.name,phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretaccesstoken', { expiresIn: "86400s" });
                let refreshToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretrefreshtoken', { expiresIn: "7d" })            
                
                if (sha1 == all.password) {
                    accessTokens.push(accessToken);
                    console.log(accessTokens);
                    res.status(200).json({message:'Welcome Waiter',role:loadedActiverole, your_accessToken: accessToken,your_refreshToken: refreshToken, Id: loadedAll._id.toString()});
                    return loadedAll;
            }}
            else if (all.activerole == 'manager'){
                loadedAll = all;
                loadedActiverole = all.activerole;
                var sha1 = crypto.createHash('sha1').update(password).digest('hex');
                let accessToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretaccesstoken', { expiresIn: "86400s" });
                let refreshToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretrefreshtoken', { expiresIn: "7d" })            
                
                if (sha1 == all.password) {
                    accessTokens.push(accessToken);
                    console.log(accessTokens);
                    res.status(200).json({message:'Welcome Manager',role:loadedActiverole, your_accessToken: accessToken,your_refreshToken: refreshToken, Id: loadedAll._id.toString()});
                    return loadedAll;
            }}
            else if (all.activerole == 'admin'){
                loadedAll = all;
                loadedActiverole = all.activerole;
                var sha1 = crypto.createHash('sha1').update(password).digest('hex');
                let accessToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretaccesstoken', { expiresIn: "86400s" });
                let refreshToken = jwt.sign({ email: loadedAll.email,name:loadedAll.name, phone: loadedAll.phone, Id: loadedAll._id.toString() }, 'somesupersecretrefreshtoken', { expiresIn: "7d" })            
                
                if (sha1 == all.password) {
                    accessTokens.push(accessToken);
                    console.log(accessTokens);
                    res.status(200).json({message:'Welcome Admin',role:loadedActiverole, your_accessToken: accessToken,your_refreshToken: refreshToken, Id: loadedAll._id.toString()});
                    return loadedAll;
            }}
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
});


router.delete('/delete/:allId',(req,res,next) =>{
    const allId = req.params.allId;
    All.findByIdAndDelete(allId)
        .then(all=>{
            if(!all){
                const error= new Error('There are no such persons');
                error.statusCode = 404;
                throw error;
            }
            else{
                all.remove();
                return res.status(200).json({message:"Deleted successfully :) "});
            }
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });

});

router.get('/geteveryone',(req,res,next) =>{
    const CurrentPage = req.query.page || 1;
    const perPage = 100;
    let totalPersons;
    All.find()
      .countDocuments()
      .then(count => {
        totalPersons = count;
        return All.find()
          .skip((CurrentPage - 1) * perPage)
          .limit(perPage)
      })
      .then(all => {
        res.status(200)
          .json({
            message: 'Fetched everyone Successfully',
            persons: all,
            totalPersons: totalPersons
          });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
});

router.post('/forgot',auth.auth,(req, res, next) => {    
    const userId = req.params.userId;
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, Number: true, alphabets: false });
    const email = req.body.email;
    let creator;
    let loadedAll;
    const ot = new OTP({
        ot: otp,
        creator: All._id,
        date: new Date()
    });
        All.findOne({ email: email })
            .then(all => {
                if (!all) {
                    const error = new Error('No one with this email exists in database');
                    error.statusCode = 404;
                    res.status(404).json({ message: 'No one with this email exists in database' });
                }
              else{  transporter.sendMail({
                    to: email,
                    from: 'hello-here.com',
                    subject: 'RESET here!!!',
                    html: ` <p>Your OTP  ${otp}</p>
                <p>For password reset click</p>      
                <a href = http://192.168.29.121:3000/admin-reset here>here</a></p>`
                })
                 ot.save();
            }               
                return All.findOne({ email: email });
            })
            .then(all => {
                creator = all;
                all.otps.push(ot);
                res.status(200).json({ message: 'your otp:', otp: otp, creator: { _id: creator._id } });
                return all.save();
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            })
});

router.get('/get',(req,res,next) =>{
    const activerole = req.body.activerole;
    All.find({activerole:activerole})
        .then(all=>{
            if(!all){
                return res.status(404).json({message:"There are no person with such roles"});
            }
            else if(activerole == ""){
                return res.status(404).json({message:"There are no person with such roles"});
            }
            else{
                return res.status(200).json({message:"Here is the list you asked for..", list:all});
            }           
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
});

router.post('/reset',(req, res, next) => {
    const newPw = req.body.password;
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    const  email = req.body.email;
    const otp1 = req.body.otp1;
    OTP.findOne({ ot: otp1 })
        .then(ot => {
            if (!ot) {
                const error = new Error('An otp could not be found');
                error.statusCode = 404;
                res.json({ message: "An otp could not be found" });
            }
            else{
                return All.findOne({ email : email})
            }
        })    
        .then(all => {
            if(!all){
                res.status(401).json({ message: 'An admin with this email could not be found' });
            }
            else
            {const newPw = req.body.password;
            all.password = newPw;
            var sha1 = crypto.createHash('sha1').update(newPw).digest('hex').toString();
            all.password = sha1;
            all.save();
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
});

router.put('/updaterole',auth.auth,(req,res,next) =>{
    const activerole = req.body.activerole;
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    All.findOne({email})
    .then(all=>{
        if(!all){
            return res.status(400).json({message:'There are no such person !!!'});
        }
        all.activerole = activerole;
        console.log(all.roles);
        if(all.roles.includes(activerole)){
            return res.status(500).json({message:'You already have that role'});
        }
        else{
            all.roles.push(activerole);
            return all.save();
        }
    })
    .then(result =>{
        return res.status(200).json({message:"Role updated successfully", UpdatedRole : result})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
});

router.put('/switchrole',auth.auth,(req,res,next) =>{
    const activerole = req.body.activerole;
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    All.findOne({email})
    .then(all=>{
        if(!all){
            return res.status(400).json({message:'There are no such person !!!'});
        }        
        console.log(all.roles);
        if(all.roles.includes(activerole)){
            all.activerole = activerole;
            all.save();
            return res.status(200).json({message:`You are ${activerole} from now on.!`});
        }
        else{            
            return res.status(404).json({message:'You do not have this role in your possession !!!'});
        }
    })
    .then(result =>{
        return res.status(200).json({message:"Role updated successfully", UpdatedRole : result})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })       

});

router.delete('/delete/:allId',  (req, res, next) => {
    const allId = req.params.allId;
    All.findById(allId)
      .then(all => {
        if (!all) {
          const error = new Error('Could not find user.');
          error.statusCode = 404;
          throw error;
        }
        return Product.findByIdAndDelete(allId);
      })      
      
      .then(result => {
        console.log(result);
        res.status(200).json({ message: 'user removed!!' })
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });
  

router.put('/update/all/:allId',(req, res, next) => {
    const allId = req.params.allId;
    const email = req.body.email;
    const phone = req.body.phone;
    const name = req.body.name;
    
    if (!email) {
      const error = new Error('No email found.');
      error.statusCode = 422;
      throw error;
    }
    All.findById(allId)
      .then(all => {
        if (!all) {
          const error = new Error('Could not find user.');
          error.statusCode = 404;
          throw error;
        }
        all.email = email;
        all.phone = phone;
        all.name = name;
        return all.save();
        })
      .then(result => {
        return res.status(200).json({ message: 'user updated!', user: result});
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });

module.exports = router;




