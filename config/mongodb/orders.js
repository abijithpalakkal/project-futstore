const mongoose=require("mongoose")
const { Schema } = mongoose;

mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("ordersdb running successfully")
})
.catch(()=>{
    console.log("ordersdb  failed to connect")
})

const orderSchema=new mongoose.Schema({
    userid:{
        type: Schema.Types.ObjectId,
        required:true,
        ref:'Users'
    },
    total_price:{
        type:Number,
        required:true
    },
    items:[{
        productid:{
            type: Schema.Types.ObjectId,
            ref:'products'
        },
        price:{type:Number},
        quantity:{type:Number},
        size:{type:String}
    }],
    orderdate:{
        type:Date,
        required:true
    },
    method:{
        type:String,
        required:true
    },
    status:{
       type:String,
       required:true
    },
    address:{
        type: Schema.Types.ObjectId,
        ref:'Users',
        required:true,
    }

})

const orders=new mongoose.model('order',orderSchema)
module.exports=orders