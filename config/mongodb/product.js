const mongoose=require("mongoose")
const { Schema } = mongoose;
const { array } = require("../../middlewares/multer")

mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("productdb running successfully")
})
.catch(()=>{
    console.log("productdb failed to connect")
})

const productSchema=new mongoose.Schema({
    ProductName:{
        type:String,
    },
    Description: { 
        type: String 
    },
    Brand: { 
        type: String 
    },
    Catagory: {
         type: String, 
        },
  Type: { 
    type: String,
},
  RealPrice: {
     type: Number
    },
  OfferPrice: { 
    type: Number 
},
  status:{
    type:String,
    default:"active"
  },
Color: {
    type:String
},
Images: {
    type:Array,
    
  },
  Size:{
    type:Array,
    
  },
  
 
  Quantity:[{
    type:Number}
  ],
  Speckey:{
    type:Array,
    
  },
  Specvalue:{
    type:Array,
    
  },
  rating:{
    type:Number
  },

  Gender: {
     type: String 
    },
  KidsCatagory: { 
    type: String,enum: ['yes', 'no']
}
  
})
const products= new mongoose.model('products', productSchema);
module.exports=products