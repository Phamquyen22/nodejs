var express = require('express');
var router = express.Router();
var User = require('../models/user');
const order_db = require('../models/order');
var bcrypt = require('bcryptjs');
var passport = require('passport');
const order = require('../models/order');
var LocalStrategy = require('passport-local').Strategy;
const productCategory = require("../controllers/admincontroller");
const { render } = require('../app');



/* GET home page. */
const isAuthenticated = (req, res, next) => {
  const taikhoan = req.session.taikhoan;
  if (req.session.taikhoan=='admin') {
    
      return next();
    
  } else {
    res.redirect('/admin/login'); // Redirect to your login page
  }
};

router.get('/admin', async function (req, res, next) {
  try {
    
    const taikhoan = req.session.taikhoan;
    const orders = await order_db.find();
    const targetMonth = req.params.month || new Date().getMonth();
    const thanglast = await order_db.find({
      $expr: { $eq: [{ $month: '$date' }, parseInt(targetMonth)] },
    });
    const thangnow = await order_db.find({
      $expr: { $eq: [{ $month: '$date' }, parseInt(targetMonth+1)] },
    });

    
    const orderCount = await order_db.countDocuments({});
    var tong=0;
    for (const i in orders){
      tong=tong+orders[i].cart.totalPrice
    }
    var doanhthunow=0;
    for(const i in thangnow){
      doanhthunow= doanhthunow+thangnow[i].cart.totalPrice
    }
    var doanhthulast=0;
    for(const i in thanglast){
      doanhthulast= doanhthulast+thanglast[i].cart.totalPrice
    }
    var thangnay=targetMonth+1
    if (req.session.taikhoan=='admin')
      res.render('admin/main/index', { taikhoan: taikhoan,orders,orderCount ,tong,
    doanhthunow,doanhthulast,targetMonth,thangnay});
    else
      res.redirect('/admin/login')
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/admin/product/danh-sach.html',isAuthenticated, productCategory.sanpham);
router.get('/admin/product/them-product.html',isAuthenticated, productCategory.themsp);
router.post('/admin/product/them-product.html',isAuthenticated, productCategory.themspmoi);

router.get('/admin/cart/danh-sach.html',isAuthenticated, productCategory.order);
router.get('/admin/cart/:orderId/xem-cart.html',isAuthenticated,productCategory.xemhang)
router.get('/admin/cart/:orderId/xac-nhan.html',isAuthenticated,productCategory.xacnhandon)
router.get('/admin/cart/:orderId/hoan-thanh.html',isAuthenticated,productCategory.hoanthanh)
router.get('/admin/cart/:orderId/xoa-cart.html',isAuthenticated,productCategory.xoaorder)

router.get('/admin/login', productCategory.login);
router.post('/admin/login', productCategory.login);

router.get('/admin/product/:productId/sua-product.html',isAuthenticated,productCategory.suasanpham)
router.post('/admin/product/:productId/sua-product.html',isAuthenticated,productCategory.suasanphampost)
router.get('/admin/product/:productId/xoa-product.html',isAuthenticated,productCategory.xoasp)

router.get('/admin/dang-xuat.html',productCategory.logout)
module.exports = router;


module.exports = router;