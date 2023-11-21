const user=require("../config/mongodb/user.js")
const{sendotp}=require("../service/otp.js")
const products=require("../config/mongodb/product.js")
const session=require("express-session")
const cart=require("../config/mongodb/cart.js")
const orders=require("../config/mongodb/orders.js")
const wishlist=require("../config/mongodb/wishlist.js")
const reviews=require("../config/mongodb/review.js")
const wallet=require("../config/mongodb/wallet.js")
const wallettransaction=require("../config/mongodb/wallettransaction.js")
const { ObjectId } = require("mongoose").Types;
const coupons=require("../config/mongodb/coupons.js")


const getfirst=(req,res)=>{
  
    res.redirect("/home")
  
  
  
}


const getsignup=(req,res)=>{
  if(req.params.id){
   req.session.referral=req.params.id
  }
    res.render("./userfold/usersignup.ejs")
 }
  
 const postsignup=async(req,res)=>{
    
    
    req.session.tempuserdetails=req.body
   
     
    
      res.redirect("/getotp")
     
    }

    const getgetotp=(req,res)=>{
        var email=req.session.tempuserdetails.email
        var OTP = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(OTP)
        var timestamp = new Date().getTime();
        req.session.timestamp=timestamp
        req.session.otp=OTP
        
        sendotp(email,OTP)
       
        res.render("./userfold/verifyemail.ejs")
      }

      const postverifyotp=async(req,res)=>{
     
      
        const currentTime = new Date().getTime();
        const otpTimestamp = req.session.timestamp;
        const otpExpiryTime = 5 * 60 * 1000; 
        
              if(req.body.verificationCode==req.session.otp){

        if (currentTime - otpTimestamp > otpExpiryTime) {
           const message="otp expired!"
            res.render("./userfold/verifyemail.ejs",{message})
          } else {
            
           const date=new Date()
            let data={
              Username:req.session.tempuserdetails.name,
              Email:req.session.tempuserdetails.email,
              Password:req.session.tempuserdetails.password,
              creationdate:date
          }
            await user.insertMany([data])
            req.session.tempusername=req.session.tempuserdetails.name
            req.session.userid=true
            var check=await user.findOne({ Email:req.session.tempuserdetails.email})
            req.session.tempuserdetails=check
            if(req.session.referral){
              await wallet.updateOne({ userid: req.session.referral }, { $inc: { wallet: 150 } });
              const date1=new Date()
              await wallettransaction.create({userid:req.session.referral,description:"credited",amount:150,date:date1})
              req.session.referral=null

            }
            
           res.redirect("/home")
          }
        }else{
          const message="invalid otp!"
            res.render("./userfold/verifyemail.ejs",{message})
        }
    }

    

     const getlogout=(req,res)=>{
      req.session.userid=false
      delete req.session.tempuserdetails
      res.render("./userfold/login.ejs")
     }

     const postlogin=async(req,res)=>{
      try{
      var check=await user.findOne({ Email:req.body.email})
      
      if(check.Password==req.body.password){
        req.session.userid=true
        req.session.tempuserdetails=check

        
        res.redirect("/home")
    }else{
      const message="invalid password!"
      res.render("./userfold/login.ejs",{message})
    }
     }catch{
      const message="invalid username!"
      res.render("./userfold/login.ejs",{message})
     }
    
    }
    

  const getwishlist=async(req,res)=>{
    
    const data=await wishlist.findOne({userid:req.session.tempuserdetails._id}).populate('productid')
     
  
   res.render("./userfold/wishlist.ejs",{data})
     
   
    
}
//ajax api


 



const postaddtowishlist=async(req,res)=>{
  
  const existingwishlist= await wishlist.find({userid:req.body.userid})
  
  if(existingwishlist.length==0){
    
    await wishlist.create(req.body)
    res.json("added to wishlist")
    
  }else{
    if(existingwishlist[0].productid.includes(req.body.productid)){
      res.json("already added")
    }else{
    await wishlist.updateOne({userid:req.body.userid},{$push:{productid: req.body.productid}})
    res.json("added to wishlist")
    }
  }
}

  const postquantitychange=async(req,res)=>{



    if(req.body.quantity=="inc"){
     await cart.updateOne({userid:req.session.tempuserdetails._id}, { $inc: { [`quantity.${req.body.productindex}`]: 1 } })
    }
    if(req.body.quantity=="dec"){
     const data=await cart.findOne({userid:req.session.tempuserdetails._id})
     if(data.quantity[req.body.productindex]!=1)
     await cart.updateOne({userid:req.session.tempuserdetails._id}, { $inc: { [`quantity.${req.body.productindex}`]: -1 } })
    }
    const response=await cart.findOne({userid:req.session.tempuserdetails._id}).populate('productid')
    response.productid.reverse()
    
    const sizeToFind = response.size[req.body.productindex];
    let quantityFound;
    
    for (let i = 0; i < response.productid[req.body.productindex].Size.length; i++) {
        if (response.productid[req.body.productindex].Size[i]==sizeToFind) {
            quantityFound = response.productid[req.body.productindex].Quantity[i];
            break;
        }
    }
   
    
    if(quantityFound<response.quantity[req.body.productindex]){
      // response.i="stock out"
      res.json({response, status:"stock out",i:req.body.productindex})
    }else{
      //response.i="in stock"
      res.json({response, status:"in stock",i:req.body.productindex})

    }
    
    /*res.json(response)*/

 }
 const getshippingaddress=async(req,res)=>{
const a=await user.findOne({_id:req.session.tempuserdetails._id})
const data=a.addresses
res.locals.userdetails=req.session.tempuserdetails
  res.render("./userfold/shippingaddress.ejs",{data})
}


const getaddadress=(req,res)=>{
  res.render("./userfold/addaddress.ejs")
}

const postaddaddress=async(req,res)=>{
  
  const newAddress = {
    name: req.body.name,
    address_label: req.body.address_label,
    state: req.body.state,
    city: req.body.city,
    country: req.body.country,
    fullAddress: req.body.fullAddress,
    pincode: req.body.pincode,
    mobile_no: req.body.mobile_no
  };
  const data=await user.updateOne({_id:req.session.tempuserdetails._id},{$push:{addresses:newAddress}})
  
  res.redirect("/shippingaddress")
}
const postremoveaddress=async(req,res)=>{
  const index=req.params.id
  const data=await user.findOne({_id:req.session.tempuserdetails._id})
  const b=data.addresses[index]._id
 
  await user.updateOne({_id:req.session.tempuserdetails._id},{$pull:{addresses:{_id:b}}})
  
  res.redirect("/shippingaddress")
}
const getcheckout=async(req,res)=>{
  try{
  
  const data=await user.findOne({_id:req.session.tempuserdetails._id})
  const userdata=data.addresses
  const cartdata=await cart.findOne({userid:req.session.tempuserdetails._id}).populate('productid')
  const wallets=await wallet.findOne({userid:req.session.tempuserdetails._id})
  var walletbalance={}
  if(wallets==null){
    walletbalance.wallet=0;
  }else{
    walletbalance=wallets
  }
  console.log(walletbalance)
  if(req.params.id){
    const coupondata=await coupons.findOne({_id:req.params.id})
    req.session.coupondetails=coupondata
    res.render("./userfold/checkoutpage.ejs",{userdata,cartdata,walletbalance,coupondata})
  }else{
    const coupondata=null
  res.render("./userfold/checkoutpage.ejs",{userdata,cartdata,walletbalance,coupondata})
  }
}catch{
  res.render("./userfold/user404page.ejs")
}
}
const geteditaddress=async(req,res)=>{
  try{
  const id=req.params.id
  const a=await user.findOne({_id:req.session.tempuserdetails._id})
  const data=a.addresses[id]
  data.index=id
  
  res.render("./userfold/editaddress.ejs",{data})
  }catch{
    res.render("./userfold/user404page.ejs")
  }
}
const posteditaddress=async(req,res)=>{
  try{
  var id=req.params.id
  await user.updateOne({_id:req.session.tempuserdetails._id},{ $set: {  [`addresses.${id}`]: req.body} })
  res.redirect("/shippingaddress")
  }catch{
    res.render("./userfold/user404page.ejs")
  }
}



const getaccountsettings=async(req,res)=>{
  try{
  const data=await user.findOne({_id:req.session.tempuserdetails._id})
  
  res.render("./userfold/accountsettings.ejs",{data})
  }catch{
    res.render("./userfold/user404page.ejs")
  }
}


const postaccountsettings=async(req,res)=>{
   
  const data=await user.findOne({_id:req.session.tempuserdetails._id})
  if(req.body.newPassword){
  
  if(data.Password==req.body.currentPassword){
      const updateddata={
          
          Password:req.body.newPassword
      }
      await user.findOneAndUpdate({_id:req.session.tempuserdetails._id},{$set:updateddata})
      const message2="password updated successfully"
      res.render("./userfold/accountsettings.ejs",{message2,data})
  }
}else{
  if(data.Password==req.body.currentPassword){
  const updateddata={
      Username:req.body.Username,
      Email:req.body.Email
  }
  await user.findOneAndUpdate({_id:req.session.tempuserdetails._id},{$set:updateddata})
  const message1="data updated successfully"
      res.render("./userfold/accountsettings.ejs",{message1,data})
  }

}  
}
const getforgotpassword=(req,res)=>{
  res.render("./userfold/forgotpassword.ejs")
}
const postsendotpforforgot=async(req,res)=>{
  const email=req.body.email
  req.session.forgotpasswordemail=email
  
  const a=await user.findOne({Email:req.body.email})
  if(a!=null){
  var OTP = Math.floor(1000 + Math.random() * 9000).toString();
  var timestamp = new Date().getTime();
  req.session.timestamp=timestamp
  req.session.otp=OTP
  
  sendotp(email,OTP)
  res.render("./userfold/forgotpassword.ejs",{data4:"otp send in your emailid"})
  }else{
      res.render("./userfold/forgotpassword.ejs",{data:"unregistered Email"})
  }
}
const postverifyotpforgot=async(req,res)=>{
  if(req.session.forgotpasswordemail){
  if(req.session.otp==req.body.otp){
      req.session.otpvalidateforforgot=true
      res.render("./userfold/forgotpassword.ejs",{data1:"otp validation succesful,now set your new password"})
  }else{
      res.render("./userfold/forgotpassword.ejs",{data2:"incorrectotp"})
  }
}else{
  res.render("./userfold/forgotpassword.ejs",{data3:"enter email id"})
}
}
const postresetpasswordforgot=async(req,res)=>{
  if(req.session.otpvalidateforforgot){
    await user.updateOne({Email:req.session.forgotpasswordemail},{$set:{Password:req.body.newpassword}})
    delete req.session.forgotpasswordemail
    delete req.session.otpvalidateforforgot
    res.render("./userfold/login.ejs",{data:"password changed successfully"})
  }else{
    res.render("./userfold/forgotpassword.ejs",{data:"enter otp"})
  }
}
/*---------admin----------*/

const getuserdetails=async(req,res)=>{
  const data=await user.find()
  const orderss=[]
  for (let i = 0; i < data.length; i++) {
     const count = await orders.find({userid:data[i]._id})
     orderss.push(count.length);
 }
  
  res.render("./adminfold/userdetails.ejs",{data,orderss})
}


const getenableuser=async(req,res)=>{
   
  const id=req.params.id
  
  await user.updateOne({ _id:id},{ $set:{status:'active'}})
  res.redirect("/userdetails")
}

const getdisableuser=async(req,res)=>{
   
  const id=req.params.id
  
  await user.updateOne({ _id:id},{ $set:{status:'blocked'}})
  res.redirect("/userdetails")
}

const getmyreviews=async(req,res)=>{
  const data=await reviews.find({userid:req.session.tempuserdetails._id}).populate('productid')
  
  res.render("./userfold/myreviews.ejs",{data})  
}
module.exports={getsignup,getmyreviews,getenableuser,getdisableuser,getuserdetails,postverifyotpforgot,getwishlist,postaddtowishlist,postresetpasswordforgot,getforgotpassword,postsendotpforforgot,postaccountsettings,getaccountsettings,getgetotp,postsignup,postverifyotp,postremoveaddress,postaddaddress,geteditaddress,posteditaddress,getcheckout,getlogout,postlogin,getfirst,postquantitychange,getshippingaddress,getaddadress,}