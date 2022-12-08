var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  let products=[{
    name: "Samsung Galaxy S22",
    category:"Mobile",
    description:"New Launch 5G mobile",
    image:"https://rukminim1.flixcart.com/image/832/832/l3khsi80/mobile/f/s/y/galaxy-s22-ultra-5g-sm-s08edrginu-sm-s908e-ds-samsung-original-imagenuuky3dbc2d.jpeg?q=70"
  },
  {
    name: "Apple Iphone 14 Pro",
    category:"Mobile",
    description:"New Series",
    image:"https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/9/f/p/-original-imaghxenhnpyhn5u.jpeg?q=70"
  },
  {
    name: "Redmi Note 11",
    category:"Mobile",
    description:"Latest Featured Segment phone",
    image:"https://rukminim1.flixcart.com/image/312/312/xif0q/mobile/p/5/r/redmi-note-11-2201117ti-mi-original-imaggghwgnzxzzvm.jpeg?q=70"
  },
  {
    name: "Nothing Phone 1",
    category:"Mobile",
    description:"Trending smartphone segment",
    image:"https://rukminim1.flixcart.com/image/832/832/l5h2xe80/mobile/5/x/r/-original-imagg4xza5rehdqv.jpeg?q=70"
  }]
  res.render('index', { products});
});

module.exports = router;
