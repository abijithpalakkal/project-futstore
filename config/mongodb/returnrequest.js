const mongoose=require("mongoose")
const { Schema } = mongoose;
mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("returnproductdb running successfully")
})
.catch(()=>{
    console.log("returnproductdb  failed to connect")
})


const returnSchema=new mongoose.Schema({
    userid:{
        type: Schema.Types.ObjectId,
    },
    orderid:{
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    reason:{
        type:String
    }
})
const returnproducts=new mongoose.model('returnproduct',returnSchema)
module.exports=returnproducts