
function nameverify(req,res,next){
    console.log("hello")
    
if(req.session.tempuserdetails){
    res.locals.name4=req.session.tempuserdetails.Username
    console.log(res.locals.name4)
    console.log(req.session.tempuserdetails)
}else{
    res.locals.name4="login"
}
next()
}

module.exports={nameverify}