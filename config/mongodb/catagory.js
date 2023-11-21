const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("catagorydb running successfully")
})
.catch(()=>{
    console.log("catagorydb  failed to connect")
})
const CatagorySchema=new mongoose.Schema({
     Category:{
        type: String ,
        require:true
     },
     type:{
        type:Array,
        require:true
     }
})
const Catagory = new mongoose.model('Catagories', CatagorySchema);
module.exports=Catagory