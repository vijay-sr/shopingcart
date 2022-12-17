const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var userHelpers= require('../helpers/user-helpers')




/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  console.log(user);
  productHelpers.getAllProducts().then((products)=>{
    // console.log(products);
     res.render('users/view-products', {products, user });    
   })
}); 
router.get('/login',function(req,res){
  if(req.session.loggedIn){
    res.redirect('/')
  }
  res.render('users/login')
})
router.get('/signup',function(req,res){
  res.render('users/signup')
 })
router.post('/signup',function(req, res){
  userHelpers.doSignup(req.body) 
  res.redirect('/')
  })
router.post('/login',function(req,res){
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      res.render('users/login',{loginStatus:"Login failed, wrong email or password"})
    }
}
)
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
const verifyLogin= (req,res,next)=>{
  if(req.session.loggedIn){
    next()}
    else{
    res.redirect('/login')
  }
}
router.get('/cart',verifyLogin,(req,res)=>{
  res.render('users/cart')
})

module.exports = router;
