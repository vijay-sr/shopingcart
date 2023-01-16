var express = require('express');
const { response } = require('../app');
const { getAllProducts } = require('../helpers/product-helpers');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
/* GET users listing. */


const verifyLogin= (req,res,next)=>{
  if(req.session.admin){
    next()}
    else{
    res.redirect('/admin/')
  }
}

router.get('/', function(req,res){
  if(req.session.admin){
    res.redirect('/admin/view-products')
     }else{
  res.render('admin/adminLogin',{admin:true})
  // req.session.adminLoginErr=false
  // "loginErr":req.session.adminLoginErr
     }  
})

router.post('/',function(req,res){
  productHelpers.adminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin=response.admin
      req.session.admin.loggedIn=true
               res.redirect('/admin/view-products')  
    }else{
      req.session.userLoginErr="Invalid username or password"//
      // res.render('admin/adminLogin',{loginStatus:"Login failed, wrong email or password"})
    }
})
})
router.get('/adminSignup',function(req,res){
  let admin=req.session.admin

  res.render('admin/adminSignup',{admin})
 })
router.post('/adminSignup',function(req, res){
  productHelpers.adminSignup(req.body).then((response)=>{ 
    console.log(response);
  if(response.status){
  req.session.admin=response.admin
  req.session.loggedIn=true
  res.redirect('/admin/')
  }else{
    res.render('admin/adminSignup', {title:"Admin already exists"})
  }
  })
  })


router.get('/adminLogout',(req,res)=>{
  // req.session.destroy()
  req.session.admin=null 
  res.redirect('/admin/')
})


router.get('/view-products', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
   console.log(products);
   let admin=req.session.admin
    res.render('admin/view-products', { admin, products});    
  })
});

router.get('/add-products', verifyLogin,(req, res)=>{
  let admin=req.session.admin
  res.render('admin/add-products',{admin})

})
router.post('/add-products', (req, res) => {
  productHelpers.addProduct(req.body, (insertedId) => {
    let Image = req.files.image;
    const imageName = insertedId
    Image.mv('./public/product-image/' + imageName + '.jpg', (err, done) => {
      if (!err) {
  let admin=req.session.admin
        res.render('admin/add-products',{admin})
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view-products')
    console.log(response); 
  })
})
router.get('/edit-product/:id',verifyLogin, async (req,res)=>{
  let product=await productHelpers.editProduct(req.params.id)
    console.log(product);
  let admin=req.session.admin
  res.render('admin/edit-product',{product,admin})
})
router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
  // let admin=req.session.admin
  res.redirect('/admin/view-products')  
        if(req.files.image){
      let Image=req.files.image
      Image.mv('./public/product-image/'+id+'.jpg')
    }
  })
})


module.exports = router;
