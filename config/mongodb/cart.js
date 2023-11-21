const mongoose=require("mongoose")
const { Schema } = mongoose;


mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("cartdb running successfully")
})
.catch(()=>{
    console.log("cartdb  failed to connect")
})
const cartSchema=new mongoose.Schema({
    userid:{
        type: Schema.Types.ObjectId,
        required:true
    },
    productid: [
        {
          type: Schema.Types.ObjectId,
          ref:'products',
          // You can specify other options or validation rules here
          required:true
        }
      ],
      quantity: {
        type: [Number],
        
        required:true
      },
    
    size:{
        type:[{
            type:String,
            required:true
        }],
       
    }
})
const cart=new mongoose.model('cart',cartSchema)
module.exports=cart