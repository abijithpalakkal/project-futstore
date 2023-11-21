const wishlist=require("../config/mongodb/wishlist.js")
const cart=require("../config/mongodb/cart.js")


const postremovewishlistitems=async(req,res)=>{
    
    try{
    await wishlist.updateOne({userid:req.session.tempuserdetails._id},{ $pull: { productid: req.body.productid }});
    }catch{
        console("error")
    }
    res.json("data")
}

const postaddtocartfromwishlist=async(req,res)=>{
    if(req.body.size==null || !req.body.size){
        res.json("select a size")
    }else{
    
    const existingCart = await cart.find({userid:req.session.tempuserdetails._id});
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
       await cart.updateOne({userid:req.session.tempuserdetails._id},{$push: { productid: req.body.productid, size: req.body.size,quantity:req.body.quantity}})
       res.json("added to cart")
       }
     }else{
        
            // If no cart document is found, create a new one
            const data=req.body
            data.userid=req.session.tempuserdetails._id;
            await cart.create(data);
            res.json("added to cart")
          
     }
    }
}
module.exports={postremovewishlistitems,postaddtocartfromwishlist}