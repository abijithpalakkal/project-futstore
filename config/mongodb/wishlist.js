const mongoose=require("mongoose")
const { Schema } = mongoose;


mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("wishlistdb running successfully")
})
.catch(()=>{
    console.log("wishlistdb  failed to connect")
})
const wishlistSchema=new mongoose.Schema({
    userid:{
        type: Schema.Types.ObjectId,
        required:true
    },
    productid: [
        {
          type: Schema.Types.ObjectId,
          ref:'products',
          required:true
        }
      ],
      
    
    
})
const wishlist=new mongoose.model('wishlist',wishlistSchema)
module.exports=wishlist