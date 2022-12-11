var MongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){ 
    const dbname='shoppingcart'


MongoClient.connect("mongodb://localhost:27017",function(err,data){
if(err){
    return done(err);
        
    }
    else{
    state.db=data.db(dbname) 
    }
})
done()

}
module.exports.get=function(){
    return state.db 
}