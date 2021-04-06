const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');


const homeRoutes = require('./routes/home');
const postRoutes = require('./routes/post');
const adminRoutes = require('./routes/admin');
const managerRoutes = require('./routes/manager');
const cookRoutes = require('./routes/cook');
const waiterRoutes = require('./routes/waiter');
const categoryRoutes = require('./routes/categorypost');
const subcategoryRoutes = require('./routes/subcategorypost');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const cartRoutes = require('./routes/cart');
const bookRoutes = require('./routes/book');
const app = express();


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      return cb (null,`${file.fieldname}_${Date.now()}${file.originalname}`)
    }
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'video/mkv' ||
      file.mimetype === 'video/avi' ||
      file.mimetype === 'video/mp4'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

app.use(bodyParser.json()); 
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('imageUrl'));
  app.use('/images', express.static(path.join(__dirname, 'images')));
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/home', homeRoutes);
app.use('/feed',postRoutes);
app.use('/admin',adminRoutes);
app.use('/manager', managerRoutes);
app.use('/cook',cookRoutes);
app.use('/waiter',waiterRoutes);
app.use('/categorypost',categoryRoutes);
app.use('/subcategorypost',subcategoryRoutes);
app.use('/menu',menuRoutes);
app.use('/order',orderRoutes)
app.use('/cart',cartRoutes);
app.use('/book',bookRoutes);

mongoose.connect('mongodb+srv://nodejs:Avi12345@cluster0.tt0km.mongodb.net/myProject?retryWrites=true&w=majority',{ useNewUrlParser: true , useUnifiedTopology: true })
.then(result =>{
    app.listen(8020);
})
.catch(err=>console.log(err))
