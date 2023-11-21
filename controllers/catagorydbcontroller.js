const catagory=require("../config/mongodb/catagory.js")
const brands=require("../config/mongodb/brands.js")

const getcatagory=async(req,res)=>{

    const data=await catagory.find()
    const data1=await brands.findOne()
    
       res.render("./adminfold/viewcatagoryandbrand.ejs",{data,data1})
    }

const getaddcatagory=(req,res)=>{
    res.render("./adminfold/addcatagory.ejs")
 }
 
const postaddcatagory=async(req,res)=>{
   
    await catagory.create(req.body)
    res.redirect("/catagory")
 }
 

 const geteditcatagory=async(req,res)=>{
    let id=req.params.id
    const data=await catagory.findById(id)
    res.render("./adminfold/editcatagory.ejs",{data})
 }

const posteditcatagory=async(req,res)=>{
    let id=req.params.id
    
    await catagory.findByIdAndUpdate({_id:id},req.body)
    res.redirect("/catagory")
 }
 
 
 module.exports={posteditcatagory,geteditcatagory,postaddcatagory,getaddcatagory,getcatagory} 

 