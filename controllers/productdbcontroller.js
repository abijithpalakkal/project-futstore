const catagory=require("../config/mongodb/catagory.js")
const products=require("../config/mongodb/product.js")
const orders=require("../config/mongodb/orders.js")
const brands=require("../config/mongodb/brands.js")
const reviews=require("../config/mongodb/review.js")
const offers=require("../config/mongodb/catagoryoffer.js")
const mongoose=require("mongoose")


const getaddproduct=async (req,res)=>{
    const data=await catagory.find()
    const data1=await brands.findOne()
    
    res.render("./adminfold/addproduct.ejs",{data,data1})
 }

const getviewproduct=async(req,res)=>{
    const product=await products.find()
 
    res.render("./adminfold/viewproducts.ejs",{product})
 }
const geteditproduct=async(req,res)=>{
    const id=req.params.id
    
    const data=await products.findById(id)
    const catagory1=await catagory.find()
    const brand=await brands.findOne()
    
    
    
    res.render("./adminfold/editproduct.ejs",{data,catagory1,brand})
 }
const posteditproduct=async(req,res)=>{
    let id=req.params.id
    
   
    await products.findByIdAndUpdate({_id:id},req.body)
    res.redirect("/viewproducts")
 }


const getdisableproduct=async(req,res)=>{
    const id=req.params.id
    
    await products.updateOne({ _id:id},{ $set:{status:' blocked '}})
    res.redirect("/viewproducts")
 }
 
const getenableproduct=async(req,res)=>{
    const id=req.params.id
    
    await products.updateOne({ _id:id},{ $set:{status:' active '}})
    res.redirect("/viewproducts")
 }

 const getproductdescription=async(req,res)=>{
    var id=req.params.id
    try{
    const data=await products.findById(id)
    
    const name=req.session.tempuserdetails
    console.log("render")
    console.log(data)
    const check=await reviews.find({productid:id}).populate("userid")
    var rate={
      1:0,
      2:0,
      3:0,
      4:0,
      5:0
    }
    for(var i=0;i<check.length;i++)
   {
      rate[check[i].rating]++;
   }
if(check.length>0){
   var totalRatings = Object.values(rate).reduce((acc, count) => acc + count, 0);

// Convert counts to percentages with no decimal places and add the percentage symbol
var percentageRate = {};
for (const key in rate) {
  percentageRate[key] = ((rate[key] / totalRatings) * 100).toFixed(0) + '%'; // Fixed to 0 decimal places and add %
}
}else{
   var percentageRate = { '1': '0', '2': '0%', '3': '0%', '4': '0%', '5': '0%' }
   
}
   
const d = await orders.find(
   {
     userid: req.session.tempuserdetails._id,
     items: {
       $elemMatch: {
         productid: id,
       },
     },
   }
 );
  var btnneed;
  if(d.length>0){
   btnneed="needed"
  }else{
    btnneed="not needed"
  }
  
    res.render("./userfold/productdescription.ejs",{data,name,check,rate,percentageRate,btnneed})
}catch{

  res.render("./userfold/user404page.ejs")
}
   }

    const getproductview=async(req,res)=>{
     
      const query=req.query.searchTerm||" "
      try{
       product=await products.find()

      /*const product=await products.find({
        $or: [
          { ProductName: { $regex:query , $options: 'i' } },
          { Description: { $regex:query, $options: 'i' } },
          { Brand: { $regex:query, $options: 'i' } },
          { catagory: { $regex:query, $options: 'i' } },
          { Type: { $regex:query, $options: 'i' } },
          
          // Add more fields as needed
        ],
        status:" active "
      })*/
     
      const name=req.session.tempuserdetails
      const brand=await brands.find()
      const Catagory=await catagory.find()
      const color=await products.distinct('Color')
      const offer = await offers.find()

      console.log("Products:", product);

     
         res.render("./userfold/productviewpage.ejs",{product,name,brand,Catagory,color,offer})
    }catch{
      res.render("./userfold/user404page.ejs")
    }
    }
   

 /*-------------------api---------------*/

 const postfilter=async (req,res)=>{
   const a=await products.find(req.body.data)
    
    res.json(a)
 }
 module.exports={getenableproduct,postfilter,getdisableproduct,posteditproduct,geteditproduct,getviewproduct,getaddproduct,getproductview,getproductdescription}


 
 