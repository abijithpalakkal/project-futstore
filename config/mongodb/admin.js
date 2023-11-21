const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/detailsofuser")
.then(()=>{
    console.log("admindb running successfully")
})
.catch(()=>{
    console.log("admindb failed to connect")
})
const AdminSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
});
const admin = new mongoose.model('admin', AdminSchema);

module.exports=admin