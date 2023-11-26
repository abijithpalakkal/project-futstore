const express=require("express")
const user=require("../config/mongodb/user.js")
const products=require("../config/mongodb/product.js")
const nodemailer=require("nodemailer")
const{sendotp}=require("../service/otp.js")
const session=require("express-session")
const usercontroller=require("../controllers/usercontroller.js")
const { get } = require("mongoose")
const{isUserinSession}=require("../middlewares/userauth.js")
const cart=require("../config/mongodb/cart.js")
const reviews=require("../config/mongodb/review.js")
const coupons=require("../config/mongodb/coupons.js")
const wallet=require("../config/mongodb/wallet.js")
const banners=require("../config/mongodb/banner.js")
const wallettransaction=require("../config/mongodb/wallettransaction.js")
const orders=require("../config/mongodb/orders.js")
const Razorpay = require('razorpay');
const wishlist=require("../config/mongodb/wishlist.js")
const returnrequest=require("../config/mongodb/returnrequest.js")
const cartcontroller=require("../controllers/cartdbcontroller.js")
const ordercontroller=require("../controllers/orderdbcontroller.js")
const productcontroller=require("../controllers/productdbcontroller.js")
const wishlistcontroller= require("../controllers/wishlistdbcontroller.js")
const reviewcontroller= require("../controllers/reviewdbcontroller.js")
const { ObjectId } = require("mongoose").Types;


const router=express.Router()

router.get("/home",async(req,res)=>{
  const typedata = [];
  const distinctCategories = await products.distinct("Type");
  
  for (const type of distinctCategories) {
      const document = await products.findOne({ "Type": type });
      typedata.push(document);
  }


  const data=await products.find()
  data.reverse()
   const banner1= await banners.findOne({status:"active"})
  res.render("./userfold/bannerpage.ejs",{data,typedata,banner1})
})
router.get("/",usercontroller.getfirst)
router.get("/login",(req,res)=>{
  res.render("./userfold/login.ejs")
})
router.get("/signup",usercontroller.getsignup)
router.get("/signup/:id",usercontroller.getsignup)
router.post("/signup",usercontroller.postsignup);
router.get("/getotp",usercontroller.getgetotp)
router.get("/forgotpassword",usercontroller.getforgotpassword)
router.post("/sendotpforforgot",usercontroller.postsendotpforforgot)
router.post("/verifyotpforgot",usercontroller.postverifyotpforgot)
router.post("/resetpasswordforgot",usercontroller.postresetpasswordforgot)
router.post("/verifyotp",usercontroller.postverifyotp)
router.get("/productdescription/:id",isUserinSession,productcontroller.getproductdescription)
router.get("/productview",isUserinSession,productcontroller.getproductview)
router.get("/logout",usercontroller.getlogout)
router.post("/login",usercontroller.postlogin)
router.get("/cart",isUserinSession,cartcontroller.getcart)
router.post("/addtocart",isUserinSession,cartcontroller.postaddtocart)
router.post("/quantitychange",isUserinSession,usercontroller.postquantitychange)
router.get("/checkout",isUserinSession,usercontroller.getcheckout)
router.get("/checkout1/:id",isUserinSession,usercontroller.getcheckout)
router.get("/shippingaddress",isUserinSession,usercontroller.getshippingaddress)
router.get("/addaddress",isUserinSession,usercontroller.getaddadress)
router.post("/addaddress",isUserinSession,usercontroller.postaddaddress)
router.get("/removeaddress/:id",isUserinSession,usercontroller.postremoveaddress)
router.get("/editaddress/:id",isUserinSession,usercontroller.geteditaddress)
router.post("/editaddress/:id",isUserinSession,usercontroller.posteditaddress)
router.post("/removecartitem",isUserinSession,cartcontroller.postremovecartitems)
router.get("/myorders/:id",isUserinSession,ordercontroller.getmyorders)
router.get("/orderdetails/:id",isUserinSession,ordercontroller.getorderdetails)
router.get("/accountsettings",isUserinSession,usercontroller.getaccountsettings)
router.post("/accountsettings",isUserinSession,usercontroller.postaccountsettings)
router.post("/addtowishlist",isUserinSession,usercontroller.postaddtowishlist)
router.get("/wishlist",isUserinSession,usercontroller.getwishlist)
router.get("/myreviews",isUserinSession,usercontroller.getmyreviews) 
router.post("/editreview/:id",reviewcontroller.posteditreview)
router.get("/wallet",async(req,res)=>{
    const wallet1=await wallet.findOne({userid:req.session.tempuserdetails._id})
const data=await wallettransaction.find({userid:req.session.tempuserdetails._id})
data.reverse()
    res.render("./userfold/wallet.ejs",{data,wallet1})
})
router.post("/returnproductrequest/:id",async (req,res)=>{
    const id=req.params.id
    var reasons;
    if(req.body.returnReason=="others"){
     reasons=req.body.otherReason
    }else{
        reasons=req.body.returnReason
    }
    await returnrequest.create({userid:req.session.tempuserdetails._id,orderid:id,reason:reasons})
    await orders.updateOne({_id:id},{$set:{status:"return requested"}})
    res.redirect("/orderdetails/"+id)
})
router.get("/usercoupons",async(req,res)=>{
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
  // At least one of the arrays is not null
  mergedata = (data1 || []).concat(data2 || [], data3 || []);
} else {
  // All three arrays are null
  mergedata = [];
}

console.log(mergedata);
  const referral=req.session.tempuserdetails._id
    res.render("./userfold/usercoupons.ejs",{mergedata,referral})
    
})






/*api*/
router.post("/placeorder",isUserinSession,ordercontroller.postplaceorder)
router.post("/removewhistlistitem",wishlistcontroller.postremovewishlistitems)
router.post("/onlinepayment",ordercontroller.postonlinepayment)
router.post("/addtocartfromwhistlist",wishlistcontroller.postaddtocartfromwishlist)
router.post("/filter",productcontroller.postfilter)
router.post("/cancelorder",ordercontroller.postcancelorder)
router.post("/addreview",reviewcontroller.postaddreview)
router.post("/editreviewfrompage",reviewcontroller.posteditreviewfrompage)
router.post("/cancelreturnrequest",async(req,res)=>{
    await returnrequest.deleteOne({orderid:req.body.orderid})
    await orders.updateOne({_id:req.body.orderid},{$set:{status:"Delivered"}})
    res.json("done")
})
router.post("/selectcouponfromcart",async(req,res)=>{
    const data=await coupons.findOne({_id:req.body.id})
    const userWithCoupon = await user.findOne(
        { _id: req.session.tempuserdetails._id },
        { coupons: { $elemMatch: { couponid: req.body.id } } }
      );
      
      if (userWithCoupon && userWithCoupon.coupons.length > 0) {
        // Coupon found, access the used value
        var usedValue = userWithCoupon.coupons[0].used;
        console.log(`Coupon found. Used value: ${usedValue}`);
      } else {
        // Coupon not found
        console.log(`Coupon not found.`);
      }
      if(usedValue>=data.numberofcoupons){
       res.json("used")
      }else{
      
    res.json(data)
      }
})

router.post("/selectcouponfromcarta",async(req,res)=>{
    const data=await coupons.findOne({_id:req.body.id})
    const cartdata=await cart.findOne({userid:req.session.tempuserdetails._id}).populate('productid')
    res.json({data,cartdata})
})


 module.exports=router
 
 