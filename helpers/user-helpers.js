var db = require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const { response } = require('express')
const { set } = require('../app')
module.exports = {
 
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            const salt = await bcrypt.genSalt(10)
            userData.password = await bcrypt.hash(userData.password, salt)
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if(user){
                resolve({status:false})
            }else{
            db.get().collection(collection.USER_COLLECTION).insertOne(userData)
                resolve({status:true})
                console.log(userData);  
        }
        })
    },
    doLogin: (userData) => {
        let loginStatus = false
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed 2");
                resolve(response)
            }
        })
    },
    productWindow: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
                console.log("Product ID is" + proId);
            })
        })
    },
    addToCart: (proId, userId) => {
        let prodObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            //    console.log("userId   "+userId);
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId)},
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                }
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },

                        {
                            $push: { products: prodObj }
                        }

                    ).then((response) => {
                        resolve(response)

                    })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                    console.log(response);
                })
            }

        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            // console.log(cartItems[0].products);
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeCartQuantity:(details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject)=>{
            if (details.count == -1 && details.quantity == 1){     //cart product reduce option
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })

            }else if(details.count==-2){ //cart product Remove option
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart)},
            {
                $pull: { products: { item: objectId(details.product) } }
            }
            ).then((response) => {
                resolve({ removeProduct: true })
            })
            
                
    }else {

        db.get().collection(collection.CART_COLLECTION)     //cart product increase option
            .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                {
                    $inc: { 'products.$.quantity': details.count }
                }
                ).then((response)=>{
                    resolve({status:true})
                })
            }
        })
},
getTotalAmount:(userId)=>{
    return new Promise(async (resolve, reject) => {
        let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item', 
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            },
            {
                $group:{
                    "_id":null,
                    total:{$sum:{$multiply:["$quantity",{$convert:{input:"$product.price",to:"int"}}]}}
                }
            }

        ]).toArray()
        resolve(total[0].total)
        console.log("total amount  "+total[0].total);
        })
},
placeOrder:(order,products,total)=>{
return new Promise((resolve, reject)=>{
    let status=order['payment-method']==='COD'?'placed':'pending'
    let orderObj={
        deliveryDetails:{
            name:order.name,
            address:order.address,
            mobile:order.mobile,
            city:order.city,
            state:order.state,
            pincode:order.pincode
        },
        userId:objectId(order.userId),
        date:new Date().toLocaleString(),
        // date:(new Date().toLocaleDateString("en-US", {year: 'numeric', month: 'short', day: 'numeric'})),
        // time:(new Date().toLocaleTimeString()),
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,   
    }
    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
        db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
        resolve(response)
    })
})
},
getCartProductList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        console.log(userId);
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        // let cart=await db.get().collection(collection.CART_COLLECTION).find().toArray()
        resolve(cart)
    })
},
getOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        resolve(orders)
        console.log("user Orders  ",orders);
    })
},
getViewOrderProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
        let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {_id:objectId(userId)}                
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },  
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }
        ]).toArray()
        resolve(orderItems)
        console.log("order items "+orderItems);
    })
},

getOrderPage: (userId) => {
    return new Promise(async (resolve, reject) => {
        let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {userId:objectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },  
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }
        ]).toArray()
        resolve(orderItems)
        console.log("order items "+orderItems);
    })
},
//   getSearch:(proDetails)=>{
//         return new Promise(async (resolve, reject) => {
//             let search = await db.get().collection(collection.PRODUCT_COLLECTION).find({$text:{$search:proDetails}})
//             let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
//                 {
//                     $match: { product: objectId(userId) }
//                 },
//                 {
//                     $unwind: '$products'
//                 },
//                 {
//                     $project: {
//                         item: '$products.item',
//                         quantity: '$products.quantity'
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: collection.PRODUCT_COLLECTION,
//                         localField: 'item',
//                         foreignField: '_id',
//                         as: 'product'
//                     }
//                 },
//                 {
//                     $project: {
//                         item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
//                     }
//                 }
//             ]).toArray()
//                 resolve(search)
//             console.log("search :"+search)
//     })
// }

}





