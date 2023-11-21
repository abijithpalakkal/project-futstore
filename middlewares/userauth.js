const user=require("../config/mongodb/user.js")

async function isUserinSession(req, res, next) {
  try{
  const data=await user.findOne({Email:req.session.tempuserdetails.Email})
    if ( req.session.userid && data.status=="active") {
      next();
    } else {
      res.redirect("/login");
    }
  }catch{
    res.redirect("/login");
  }
  }
  module.exports={isUserinSession}