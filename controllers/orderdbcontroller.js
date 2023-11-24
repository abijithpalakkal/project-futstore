const orders=require("../config/mongodb/orders.js")
const cart=require("../config/mongodb/cart.js")
const user=require("../config/mongodb/user.js")
const products=require("../config/mongodb/product.js")
const Razorpay = require('razorpay');
const wallet = require("../config/mongodb/wallet.js");
const wallettransaction=require("../config/mongodb/wallettransaction.js");
const coupons = require("../config/mongodb/coupons.js");


const postcancelorder=async(req,res)=>{
    const data=await orders.findOne({ _id:req.body.orderid})
    if(data.method=="wallet"||data.method=="online payment"){
      const date2=new Date()
      await wallettransaction.create({userid:req.session.tempuserdetails._id,description:"credited",amount:data.total_price,date:date2})
      await wallet.updateOne({userid:req.session.tempuserdetails._id},{$inc:{wallet:data.total_price}})
    }
    await orders.updateOne({ _id:req.body.orderid},{ $set:{status:"cancelled"}})
    res.json("cancelled")
  }

  const postplaceorder=async(req,res)=>{
    if(req.session.coupondetails){
      var isPresent = await user.findOne(
        { _id: req.session.tempuserdetails._id },
        {
          "coupons": {
            $elemMatch: {
              "couponid": req.session.coupondetails._id,
            }
          }
        }
      );
      
      if (isPresent && isPresent.coupons && isPresent.coupons.length > 0) {
        console.log("Coupon ID is present in the 'coupons' array for the specified user ID");
        await user.updateOne(
          { _id:req.session.tempuserdetails._id , "coupons.couponid": req.session.coupondetails._id },
          { $inc: { "coupons.$.used": 1 } }
        );
      } else {
        console.log("Coupon ID is not present in the 'coupons' array for the specified user ID");
        await user.updateOne({_id:req.session.tempuserdetails._id},{$push:{coupons:{couponid:req.session.coupondetails._id,used:1}}})
      }
      
     /* await user.updateOne({_id:req.session.tempuserdetails._id},{$push:{coupons:{couponid:req.session.coupondetails._id,used:1}}})*/
    }

    const orderDate = new Date();
     const cartdata=await cart.findOne({userid:req.session.tempuserdetails._id}).populate('productid')
    const data={
        userid:req.session.tempuserdetails._id,
        total_price:req.body.total,
        items:[],
        orderdate:orderDate,
        method:req.body.method,
        status:"order placed",
        address:req.body.addressindex
  
    }
    const walletdata= await wallet.findOne({userid:req.session.tempuserdetails._id})
    if( req.body.method=="wallet" && walletdata.wallet<req.body.total){
      res.json("error")
    }else{
     if(req.body.method=="wallet"){
      await wallet.updateOne({userid:req.session.tempuserdetails._id},{$inc:{wallet:-req.body.total}})
      await wallettransaction.create({userid:req.session.tempuserdetails._id,description:"debited",amount:req.body.total,date:orderDate})
     }

    for(var i=0;i<cartdata.productid.length;i++){
        const data2={
            productid:cartdata.productid[i]._id,
            price:cartdata.productid[i].OfferPrice,
            quantity:cartdata.quantity[i],
            size:cartdata.size[i]
        }
    data.items.push(data2)
           
    }
                                                                             
    try{
    await orders.create(data)
    await cart.deleteOne({userid:req.session.tempuserdetails._id})
    for(var i=0;i<cartdata.productid.length;i++){
      const index=cartdata.productid[i].Size.indexOf(cartdata.size[i])
      
      await products.updateOne({ _id:cartdata.productid[i]._id},{ $inc: { [`Quantity.${index}`]:-cartdata.quantity[i]}})
      
    }
    res.json("done")
    }catch{
        res.json("error")
    }
    
  }
}


  const getmyorders=async(req,res)=>{
    const page = parseInt(req.params.id) || 1; // Default to page 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const a = await orders.find({userid:req.session.tempuserdetails._id})
     .populate("items.productid")
      .exec();
      const totalItems = a.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    a.reverse();
    const data= a.slice(startIndex, endIndex);
    res.render("./userfold/myorders.ejs",{data,totalPages,page})
    }


    const getorderdetails=async(req,res)=>{
        const data = await orders.findOne({_id:req.params.id})
      .populate("items.productid")
       const id=req.params.id
      const addressdata=await user.findOne({_id:req.session.tempuserdetails._id},{addresses:{$elemMatch:{ _id:data.address}}})
       res.render("./userfold/orderdetails.ejs",{data,addressdata})
      }
/*----api-----*/
const postonlinepayment=(req,res)=>{
  
  var instance = new Razorpay({ key_id: 'rzp_test_G7FnMwqJajZD1e', key_secret: 'lQ191lyss01HYWVbUsNNIh4z' })
  instance.orders.create({
      amount:req.body.totalprice*100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        key1: "value3",
        key2: "value2"
      }
    }).then((response)=>{
      res.json({response,total:req.body.totalprice,address:req.body.addressindex})
    })
}      

/*-------------------admin-------------------*/

const getadminorders=async(req,res)=>{
  const page = parseInt(req.params.id) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default page size

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
   const a=await orders.find()
   const totalItems = a.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
   a.reverse()
   const data= a.slice(startIndex, endIndex);

   res.render("./adminfold/adminorders.ejs",{data,totalPages,page})
}

const postorderstatuschange=async(req,res)=>{
   
  await orders.updateOne({ _id:req.body.orderid},{ $set:{status:req.body.statuschng}})
  res.json("data1")

}

const getadminorderdetails=async(req,res)=>{
  const id=req.params.id
  const data=await orders.findOne({_id:id}).populate("items.productid")
  const addressdata=await user.findOne({_id:data.userid},{addresses:{$elemMatch:{ _id:data.address}}})
  
  
  res.render("./adminfold/adminorderdetails.ejs",{data,addressdata})
  }

const postchartchange=async (req,res)=>{
   
  let dailySalesReport
  let weekmark=0;
  if(req.body.period=="daily"){
  dailySalesReport = await orders.aggregate([
     {
       $match: {
         // Filter by the date range you are interested in
         orderdate: {
           $gte: new Date("2023-01-01"), // Start date
           $lte: new Date("2023-12-31"), // End date
         },
       },
     },
     {
       $group: {
         _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderdate" } },
         totalSales: { $sum: "$total_price" },
       },
     },
     {
       $sort: { _id: 1 }, // Sort by date
     },
   ]);
  
  }else if(req.body.period=="monthly"){
      dailySalesReport = await orders.aggregate([
        {
          $match: {
            // Filter by the date range you are interested in
            orderdate: {
              $gte: new Date("2023-01-01"), // Start date
              $lte: new Date("2023-12-31"), // End date
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$orderdate" } },
            totalSales: { $sum: "$total_price" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date
        },
      ]);
  }else if(req.body.period=="yearly"){
     dailySalesReport = await orders.aggregate([
        {
          $match: {
            // Filter by the date range you are interested in
            orderdate: {
              $gte: new Date("2023-01-01"), // Start date
              $lte: new Date("2023-12-31"), // End date
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$orderdate" } },
            totalSales: { $sum: "$total_price" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date
        },
      ]);
}else{
  weekmark=1
      dailySalesReport = await orders.aggregate([
        {
          $match: {
            // Filter by the date range you are interested in
            orderdate: {
              $gte: new Date("2023-01-01"), // Start date
              $lte: new Date("2023-12-31"), // End date
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%U", date: "$orderdate" } },
            totalSales: { $sum: "$total_price" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date
        },
      ]);
  }
  
  if(weekmark==1){
  const idsArray = dailySalesReport.map(item => item._id+" th week");
const totalSalesArray = dailySalesReport.map(item => item.totalSales);
res.json({idsArray,totalSalesArray})
  }else{
     const idsArray = dailySalesReport.map(item => item._id);
     const totalSalesArray = dailySalesReport.map(item => item.totalSales);
     res.json({idsArray,totalSalesArray})
  }

  
}

      module.exports={getorderdetails,postonlinepayment,postchartchange,getmyorders,postplaceorder,postcancelorder,getadminorders,postorderstatuschange,getadminorderdetails}