const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var userHelpers= require('../helpers/user-helpers')



/* GET home page. */
router.get('/', async function(req, res, next) {
  let user=req.session.user
  console.log(user);
  let cartCount=null;
  if(user)
  cartCount= await userHelpers.getCartCount(req.session.user._id)
  productHelpers.getAllProducts().then((products)=>{
    // console.log(products);
     res.render('users/view-products', {products, user, cartCount });    
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
  userHelpers.doSignup(req.body).then((response)=>{ 
    console.log(response);
  req.session.loggedIn=true
  req.session.user=response.user
  res.redirect('/')
  })
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
})
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



router.get('/product-window/:id',async(req,res)=>{
  let user=req.session.user
  let products = await userHelpers.productWindow(req.params.id)
    // console.log(products);
    if(user){
     cartCount= await userHelpers.getCartCount(req.session.user._id)
      res.render('users/product-window', {products,user, cartCount});  
    }else{
      res.render('users/product-window', {products,user});  
    } 
   })

   router.get('/cart',verifyLogin,async(req,res)=>{
    let cartCount= await userHelpers.getCartCount(req.session.user._id)
    let user=req.session.user
    let products= await userHelpers.getCartProducts(req.session.user._id)
    if(cartCount>0){
    let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
   console.log(products);
   console.log("cartcount :"+ cartCount);
    res.render('users/cart',{products, user,cartCount,totalValue})
    }else{
    res.render('users/cart', {user,cartCount})
    }
    
  })

  router.get('/addCart/:id',(req,res)=>{
    console.log("api call");
    // let username=req.session.user
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
      res.json({status:true})
    })

  })
  router.post('/change-product-quantity',(req,res,next)=>{
    console.log(req.body);
    userHelpers.changeCartQuantity(req.body).then(async(response)=>{
    let cartCount= await userHelpers.getCartCount(req.session.user._id)

      if(cartCount>0){
    response.total=await userHelpers.getTotalAmount(req.body.user)
      res.json(response)
      }else{ 
      res.json(response)

      }
    })
  })
  router.get('/placeOrder',verifyLogin, async(req,res)=>{
    let user=req.session.user
    let products= await userHelpers.getCartProducts(req.session.user._id)
    let cartCount= await userHelpers.getCartCount(req.session.user._id)
    let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('users/placeOrder',{products,user,cartCount,total})
  })

  router.post('/placeOrder',async(req,res)=>{
    let products= await userHelpers.getCartProductList(req.body.userId)
    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
      res.json({status:true})
    })
    console.log(req.body);
  })
  router.get('/orders',verifyLogin,(req,res)=>{
    res.render('users/orders')
  })
  



module.exports = router;
