var express = require('express');
const { response } = require('../app');
const { getAllProducts } = require('../helpers/product-helpers');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
/* GET users listing. */

router.get('/', function (req, res, next) {

  productHelpers.getAllProducts().then((products)=>{
   console.log(products);
    res.render('admin/view-products', { admin: true, products });    
  })
});

router.get('/add-products', function (req, res) {
  res.render('admin/add-products')

})
router.post('/add-products', (req, res) => {
  productHelpers.addProduct(req.body, (insertedId) => {
    let Image = req.files.image;
    const imageName = insertedId
    // console.log(insertedId);

    Image.mv('./public/product-image/' + imageName + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-products')
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
    res.redirect('/admin/')
    console.log(response);
  })
})
router.get('/edit-product/:id', async (req,res)=>{
  let product=await productHelpers.editProduct(req.params.id)
    console.log(product);
  res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/')
    if(req.files.image){
      let Image=req.files.image
      Image.mv('./public/product-image/'+id+'.jpg')
    }

  })
})


module.exports = router;
