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
  if(req.session.user){//
    res.redirect('/')
  }
  res.render('users/login',{"loginErr":req.session.userLoginErr})//
  req.session.userLoginErr=false//
})

router.get('/signup',function(req,res){
  res.render('users/signup')
 })
router.post('/signup',function(req, res){
  userHelpers.doSignup(req.body).then((response)=>{ 
    console.log(response);
  if(response.status){
  req.session.user=response.user
  req.session.user.loggedIn=true
  res.redirect('/')
  }else{
    res.render('users/signup', {title:"User already exists"})
  }
  })
})
router.post('/login',function(req,res){
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userLoggedIn=true///
      res.redirect('/')
    }else{
      // req.session.userLoginErr="Invalid username or password"
      res.render('users/login',{loginStatus:"Login failed, wrong email or password"})
    }
})
})
router.get('/logout',(req,res)=>{
  // req.session.destroy()
  req.session.user=null 
  req.session.userLoggedIn=false///
  res.redirect('/')
})
const verifyLogin= (req,res,next)=>{
  if(req.session.user){
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

   router.get('/cart',verifyLogin,async(req,res)=>{
    let cartCount= await userHelpers.getCartCount(req.session.user._id)
    let user=req.session.user
    let products= await userHelpers.getCartProducts(req.session.user._id)
    if(cartCount>0){
     // if(products.length>0)// another option
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

  router.get('/placeOrder',verifyLogin, async(req,res)=>{
    let user=req.session.user
    let products= await userHelpers.getCartProducts(req.session.user._id)
    let cartCount= await userHelpers.getCartCount(req.session.user._id)
    let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('users/placeOrder',{products,user,cartCount,total})
  })

  router.post('/placeOrder',async(req,res)=>{
    // let products= await userHelpers.getCartProductList(req.body.userId)
    let products= await userHelpers.getCartProducts(req.session.user._id)

    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
      if(req.body['payment-method']=='COD'){
        res.json({status:true})
      }else{
        userHelpers.generateRazorpay()
      }
    })
console.log("products placeorder  ", products);
    // console.log("placeorder"+response);

  })
  router.get('/order-feedback', (req,res)=>{
    let user=req.session.user
    res.render('users/orderFeedback',{user})
  })
  router.get('/orders', verifyLogin,async(req, res)=> {
    let user=req.session.user
    let orders=await userHelpers.getOrders(req.session.user._id)
    let orderItems=await userHelpers.getOrderPage(req.session.user._id)
      res.render('users/orders', {user,orders,orderItems});  
      console.log("Ordered Items!!! ", orders);  
    })

  router.get('/viewOrderProduct/:id',verifyLogin, async(req,res)=>{
    let orderItems=await userHelpers.getViewOrderProducts(req.params.id)
    res.render('users/viewOrderProduct',{user:req.session.user,orderItems})
    console.log(orderItems);
  })




module.exports = router;
