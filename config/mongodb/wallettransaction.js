const mongoose=require("mongoose")
const { Schema } = mongoose;
mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("wallettransactiondb running successfully")
})
.catch(()=>{
    console.log("wallettransactiondb  failed to connect")
})


const wallettransactionSchema=new mongoose.Schema({
    userid:{
        type: Schema.Types.ObjectId,
    },
    description:{
       type:String
    },
    amount:{
        type:Number
    },
    date:{
        type:Date
    }
})
const wallettransactions=new mongoose.model('wallettransaction',wallettransactionSchema)
module.exports=wallettransactions