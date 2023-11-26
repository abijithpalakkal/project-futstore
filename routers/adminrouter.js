const express=require("express")
const user=require("../config/mongodb/user.js")
const nodemailer=require("nodemailer")
const{sendotp}=require("../service/otp.js")
const session=require("express-session")
const admincontroller=require("../controllers/admincontroller.js")
const uploads=require("../middlewares/multer.js")
const catagory=require("../config/mongodb/catagory.js")
const products=require("../config/mongodb/product.js")
const orders=require("../config/mongodb/orders.js")
const offers=require("../config/mongodb/catagoryoffer.js")
const brands=require("../config/mongodb/brands.js")
const wallet=require("../config/mongodb/wallet.js")
const banners=require("../config/mongodb/banner.js")
const wallettransaction=require("../config/mongodb/wallettransaction.js")
const returnrequest=require("../config/mongodb/returnrequest.js")
const catagorycontroller=require("../controllers/catagorydbcontroller.js")
const brandcontroller=require("../controllers/branddbcontroller.js")
const productcontroller=require("../controllers/productdbcontroller.js")
const ordercontroller=require("../controllers/orderdbcontroller.js")
const usercontroller=require("../controllers/usercontroller.js")
const coupons=require("../config/mongodb/coupons.js")
require('dotenv').config();
const pdf = require('html-pdf');
const puppeteer = require('puppeteer');
const cron = require('node-cron');


const router=express.Router()


router.get("/admin",admincontroller.getadmin)
router.post("/adminlogin",admincontroller.postadminlogin)
router.post("/addproduct",uploads.array('Images'),admincontroller.postaddproduct)
router.get("/addproducts",productcontroller.getaddproduct)
router.get("/viewproducts",productcontroller.getviewproduct)
router.get("/editproduct/:id",productcontroller.geteditproduct)
router.post("/editproducts/:id",uploads.array('Images'),productcontroller.posteditproduct)
router.get("/catagory",catagorycontroller.getcatagory)
router.get("/addcatagory",catagorycontroller.getaddcatagory)
router.post("/addcatagory",catagorycontroller.postaddcatagory)
router.get("/editcatagory/:id",catagorycontroller.geteditcatagory)
router.post("/editcatagory/:id",catagorycontroller.posteditcatagory)
router.get("/disableproduct/:id",productcontroller.getdisableproduct)
router.get("/enableproduct/:id",productcontroller.getenableproduct)
router.get("/userdetails",usercontroller.getuserdetails)
router.get("/enableuser/:id",usercontroller.getenableuser)
router.get("/disableuser/:id",usercontroller.getdisableuser)
router.get("/adminorders/:id",ordercontroller.getadminorders)
router.get("/returnrequest",async(req,res)=>{
    const data=await returnrequest.find().populate('orderid')
    data.reverse()
    console.log(data)
    res.render("./adminfold/returnrequest.ejs",{data})
})
router.get("/coupons",async(req,res)=>{
    const data=await coupons.find()
    data.reverse()
    res.render("./adminfold/coupons.ejs",{data})
})

router.post("/submitcoupon",async(req,res)=>{
    req.body.couponcreationdate=new Date()
    await coupons.create(req.body)
    console.log(req.body)
    res.redirect("/coupons")
})
router.get("/addcoupons",(req,res)=>{
    res.render("./adminfold/addcoupons.ejs")
})
router.get("/editcoupons/:id",async(req,res)=>{
    const data=await coupons.findOne({_id:req.params.id})
    res.render("./adminfold/editcoupons.ejs",{data})
})
router.post("/editcoupon/:id",async(req,res)=>{
    const id=req.params.id
    console.log(req.body)
    await coupons.updateOne({_id:id},{$set:req.body})
    res.redirect("/coupons")
})
router.get("/deletecoupons/:id",async(req,res)=>{
    await coupons.deleteOne({_id:req.params.id})
    res.redirect("/coupons")
})
router.get("/adminbanner",async(req,res)=>{
    const live=await banners.findOne({status:"active"})
    const data=await banners.find({status:"disable"})
    console.log(live)
    console.log(data)
    res.render("./adminfold/banner.ejs",{data,live})

})
router.post("/submitbanner",uploads.single('imageUpload'),async(req,res)=>{
    console.log(req.file)
    await banners.updateOne({status:"active"},{$set:{status:"disable"}})
    await banners.create({banner:req.file.filename})
    res.redirect("/adminbanner")

})
router.get("/salesreport",async(req,res)=>{
    if(req.query.start){
    const startDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);


    
    console.log(startDate)
    console.log(endDate)

    var data=await orders.find({ orderdate: {
        $gte: startDate,
        $lte: endDate
    },status:"Delivered"}).populate('userid')
    var sum=await orders.aggregate([
        {
          $match: { status: "Delivered", orderdate: {
            $gte: startDate,
            $lte: endDate
        }}

        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total_price" }
          }
        }
      ]);

}else{
    var data=await orders.find({status:"Delivered"}).populate('userid')

    var sum=await orders.aggregate([
        {
          $match: { status: "Delivered" }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total_price" }
          }
        }
      ]);
    }
    res.render("./adminfold/salesreport.ejs",{data,sum})
})

router.post('/generate-pdf', (req, res) => {
    console.log("hello")
    console.log(req.body)
    try {
        const  htmlContent = req.body.htmlContent;

        // Set up options for html-pdf
        const options = {
            format: 'Letter',
            orientation: 'portrait',
        };

        // Generate PDF using html-pdf
        pdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error generating PDF:', err);
                res.status(500).send('Error generating PDF');
            } else {
                // Set response headers for PDF download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=downloaded.pdf');
                res.send(buffer);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get("/offers",async (req,res)=>{
    const data=await catagory.find()
    res.render("./adminfold/createcatagoryoffer.ejs",{data})
})
router.post("/submitoffer",async(req,res)=>{
    const check=await offers.find({category: req.body.category})
    if(check.length>0){
        const data=await catagory.find()
        const message = `The offer on ${req.body.category} is already active`;

    res.render("./adminfold/createcatagoryoffer.ejs",{data,message})
    }else{
        const percentageToDecimal = (percentage) => (100 - percentage) / 100;
    await offers.create(req.body)
    await products.updateMany(
        { Type: req.body.category },
        { $mul: { OfferPrice: percentageToDecimal(req.body.discount) } }
    );
    const productsToUpdate = await products.find({ Type: req.body.category });

// Update the OfferPrice in your application logic
productsToUpdate.forEach(product => {
    product.OfferPrice = Math.round(product.OfferPrice * percentageToDecimal(req.body.discount));
});

// Save the updated documents back to the database
await Promise.all(productsToUpdate.map(product => product.save()));
    }
    res.redirect("/offers")
})
router.get("/o",(req,res)=>{
    res.render("./adminfold/offers.ejs")
})


cron.schedule('*/5 * * * * *', async () => {
    try {
      // Find offers with expiry dates in the past
      const expiredOffers = await offers.find({ expirydate: { $lt: new Date() } });
  
      // Delete the expired offers
      for (const offer of expiredOffers) {
        await offers.deleteOne({ _id: offer._id });
        console.log(`Offer with ID ${offer._id} deleted.`);
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });


/*api routes*/
router.post("/orderstatuschange",ordercontroller.postorderstatuschange)
router.get("/adminorderdetails/:id",ordercontroller.getadminorderdetails)
router.get("/addbrand",brandcontroller.getaddbrand)
router.post("/addbrand",brandcontroller.postaddbrand)
router.get("/dashboard",admincontroller.getdashboard)
router.post("/chartchange",ordercontroller.postchartchange)
router.post("/returnstatuschange",async(req,res)=>{
    if(req.body.statuschng=="product received"){
       const data=await wallet.findOne({userid:req.session.tempuserdetails._id})
       const orderdetails=await orders.findOne({_id:req.body.orderid})
       if(data==null){
        await wallet.create({userid:req.session.tempuserdetails._id,wallet:orderdetails.total_price})
       }else{
        await wallet.updateOne({userid:req.session.tempuserdetails._id},{$inc:{wallet:orderdetails.total_price}})
       }
       const date1 = new Date();
      await wallettransaction.create({ userid: req.session.tempuserdetails._id, description: "credited", amount: orderdetails.total_price, date: date1 });

    }
    console.log(req.body)
     await orders.updateOne({_id:req.body.orderid},{$set:{status:req.body.statuschng}})
    res.json("success")
})


module.exports=router