const cart=require("../config/mongodb/cart.js")
const orders=require("../config/mongodb/orders.js")
const reviews=require("../config/mongodb/review.js")
const coupons=require("../config/mongodb/coupons.js")
const wallet=require("../config/mongodb/wallet.js")
const offers=require("../config/mongodb/catagoryoffer.js")
const wallettransaction=require("../config/mongodb/wallettransaction.js")
const { ObjectId } = require("mongoose").Types;

const getcart=async(req,res)=>{
  req.session.coupondetails=null
    try{
      
    const data=await cart.findOne({userid:req.session.tempuserdetails._id}).populate('productid')
    
    



    const realdata=[]
    const currentdate=new Date();
const data1=await coupons.find({coupontype:"public",expirydate: { $gt: currentdate }})
const objid=new ObjectId(req.session.tempuserdetails._id)
const totalOrderPriceAggregate = await orders.aggregate([
  {
    $match: {
      userid: objid,
      status:"Delivered"
    }
  },
  {
    $group: {
      _id: null,
      totalAmount: {
        $sum: "$total_price"
      }
    }
  }

 
]);
console.log("User ID:", req.session.tempuserdetails._id);
console.log("************")
console.log(totalOrderPriceAggregate)
console.log("*********")
const totalOrderPrice = totalOrderPriceAggregate.length > 0 ? totalOrderPriceAggregate[0].totalAmount : 0;

console.log("Total Order Price for Useris:", totalOrderPrice);



const data2 = await coupons.find({
    coupontype: 'private',
    privatecouponamount: { $lt: totalOrderPrice }, // Assuming privatecouponamount is a field in your database
    expirydate: { $gt: currentdate }
});
var data3;
if(req.session.tempuserdetails.creationdate){
  data3=await coupons.find({coupontype:'welcome',expirydate: { $gt: currentdate },couponcreationdate:{$lt:req.session.tempuserdetails.creationdate}})
}else{
    data3=null
}
console.log(data1)
console.log(data2)
console.log(data3)
let mergedata;

if (data1 || data2 || data3) {
  
  mergedata = (data1 || []).concat(data2 || [], data3 || []);
} else {
  mergedata = [];
}
    
     
    res.render("./userfold/cart.ejs",{data,mergedata})
}catch{
      const data="your cart is empty"
      res.render("./userfold/cart.ejs",{data})
    }
}

const postremovecartitems=async(req,res)=>{
  
    const index = req.body.index;
   
   
  
    // First, use $unset to set the specific index in the arrays to null
    const unsetQuery = {};
    unsetQuery[`productid.${index}`] = null;
    unsetQuery[`quantity.${index}`] = null;
    unsetQuery[`size.${index}`] = null;
  
    await cart.updateOne({userid:req.session.tempuserdetails._id}, { $unset: unsetQuery });
  
    // After $unset, use $pull to remove null elements from all three arrays
    await cart.updateOne(
      {userid:req.session.tempuserdetails._id },
      {
        $pull: {
          productid: null,
          quantity: null,
          size: null,
        },
      }
    );
        res.json(index)
  }

  const postaddtocart=async(req,res)=>{
    if(!req.body.size){
         res.json("select size")
    }else{
  
    const existingCart = await cart.find({userid:req.body.userid});
   
    if (existingCart.length>0) {
       var flag=0;
      for(var i=0;i<existingCart[0].productid.length;i++){
        if(req.body.productid==existingCart[0].productid[i]){
            if(existingCart[0].size[i]==req.body.size){
                flag=1
                res.json("already added")
                break;
            }
        }
      }
        
      // If a cart document exists with the given userid, update it
      if(flag==0){
      await cart.updateOne({userid:req.body.userid},{$push: { productid: req.body.productid, size: req.body.size,quantity:req.body.quantity}})
      res.json("added to cart")
      }
    } else {
      // If no cart document is found, create a new one
      await cart.create(req.body);
      res.json("added to cart")
    }
    }}

    module.exports={getcart,postaddtocart,postremovecartitems}