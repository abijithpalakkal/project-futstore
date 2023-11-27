const brands=require("../config/mongodb/brands.js")
const catagory=require("../config/mongodb/catagory.js")
const products=require("../config/mongodb/product.js")

const getaddbrand=async(req,res)=>{
    res.render("./adminfold/addbrand.ejs")
 }

const postaddbrand=async(req,res)=>{
   try {
      const sourceArray = req.body.type
      if (Array.isArray(sourceArray)) {
      
   await brands.updateOne({},{ $push: { brandnames: { $each: sourceArray } } })
      }else{
         await brands.updateOne({},{ $push: { brandnames:sourceArray }  })
      }
   res.redirect("/catagory")
   } catch (error) {
      console.log(error)
   }
   
 }
 
 module.exports={getaddbrand,postaddbrand}