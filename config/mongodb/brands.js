const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/futstore")
.then(()=>{
    console.log("brandsdb running successfully")
})
.catch(()=>{
    console.log("brandsdb failed to connect")})

    const brandsSchema = new mongoose.Schema({
        brandnames:[{
            type:String
        }]
    })

    const brands = new mongoose.model('brands',brandsSchema);

module.exports=brands