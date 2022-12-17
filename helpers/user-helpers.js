var db = require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
const { response } = require('express')
module.exports = {
    doSignup: (userData) => {
        //     return new Promise(async(resolve, reject)=>{

        //         userData.Password=await bcrypt.hash(userData.Password,10)

        //          db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
        //             resolve(data.ops[0])
        //     })
        // })

        new Promise(async (resolve, reject) => {
            const salt = await bcrypt.genSalt(10)
            userData.password = await bcrypt.hash(userData.password, salt)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data)
                console.log(userData);

            })
        })

    },
    doLogin: (userData)=>{
        let loginStatus=false
        let response={}
       return new Promise (async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                   
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)
                                            
                    }else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed 2");
                resolve(response)
            }  
        })
    }
}
