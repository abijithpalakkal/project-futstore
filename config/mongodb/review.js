const mongoose=require("mongoose")
const { Schema } = mongoose;
mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("reviewdb running successfully")
})
.catch(()=>{
    console.log("reviewdb failed to connect")
})

const reviewSchema=new mongoose.Schema({
        userid:{
            type: Schema.Types.ObjectId,
            required:true,
            ref: 'Users'
        },
      
        productid:{
            type: Schema.Types.ObjectId,
            required:true,
            ref: 'products'
        },
        rating:{
          type:Number
        },
        reviews:{
            type:String
        },
        date:{
            type:Date
        }
            
            
        
})
const reviews=new mongoose.model('review',reviewSchema)
module.exports=reviews