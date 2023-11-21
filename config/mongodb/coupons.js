const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("coupondb running successfully")
})
.catch(()=>{
    console.log("coupondb  failed to connect")
})
const couponSchema=new mongoose.Schema({
     couponname:{
        type:String
     },
     couponcode:{
        type:String
     },
     minimimumamount:{
        type:Number
     },
     expirydate:{
        type:Date
     },
     numberofcoupons:{
        type:Number
     },
     coupontype:{
        type:String
     },
     privatecouponamount:{
        type:Number
     },
     discountpercentage:{
        type:Number
     },
     couponcreationdate:{
    type:Date
     }
})
const coupons = new mongoose.model('coupon', couponSchema);
module.exports=coupons