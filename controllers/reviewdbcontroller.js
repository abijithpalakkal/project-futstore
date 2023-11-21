const reviews=require("../config/mongodb/review.js")
const products=require("../config/mongodb/product.js")




var obj;
var id1;
const postaddreview=async(req,res)=>{
  const currentDate = new Date();
 req.body.userid=req.session.tempuserdetails._id
 req.body.date=currentDate

const check=await reviews.find({userid:req.session.tempuserdetails._id,productid:req.body.productid})

if(check.length>0){
  id1=check[0]._id
  obj=req.body
  res.json("already reviewed")

}else{
await reviews.create(req.body)
const check=await reviews.find({productid:req.body.productid})
var sum=0;
  for(var i=0;i<check.length;i++){
    sum =sum+check[i].rating
  }
  const avg= Math.round(sum/check.length);
  await products.updateOne({_id:req.body.productid},{$set:{rating:avg}})
res.json("done")

}
}

const posteditreviewfrompage=async(req,res)=>{
  await reviews.updateOne({ _id: id1 }, { $set: obj });
  const check=await reviews.find({productid:obj.productid})
  var sum=0;
  for(var i=0;i<check.length;i++){
    sum =sum+check[i].rating
  }
  const avg= Math.round(sum/check.length);
  await products.updateOne({_id:obj.productid},{$set:{rating:avg}})

}

const posteditreview=async(req,res)=>{
  
  const id=req.params.id
  
  try{
  await reviews.updateOne({userid:req.session.tempuserdetails._id,productid:id},{$set:req.body})
  const check=await reviews.find({productid:id})
  var sum=0;
  for(var i=0;i<check.length;i++){
    sum =sum+check[i].rating
  }
  const avg= Math.round(sum/check.length);
  await products.updateOne({_id:id},{$set:{rating:avg}})
  }catch(error){
    console.log(error)
  }
  res.redirect("/myreviews")
}

module.exports={postaddreview,posteditreviewfrompage,posteditreview}