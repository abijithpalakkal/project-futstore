const product=require("../config/mongodb/product.js")

const postaddproduct=async(req,res)=>{
    
    var arr=[];
    req.files.forEach(element => {
       arr.push(element.filename)
    });
    req.body.Images=arr
    
    await product.create(req.body)
    res.redirect("/viewproducts")
}

const getdashboard=(req,res)=>{
    res.render("./adminfold/dashboard.ejs")
 }
const getadmin=(req,res)=>{
    res.render("./userfold/adminlogin.ejs")
     }


const postadminlogin=(req,res)=>{
    const email=process.env.DB_USERNAME;
    const Password=process.env.DB_PASSWORD;
    if(req.body.email==email && req.body.password==Password){
    res.redirect("/viewproducts")
    }
  }     
module.exports={postaddproduct,getdashboard,getadmin,postadminlogin}