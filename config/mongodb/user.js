const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect("mongodb://127.0.0.1:27017/futstore")
.then(()=>{
    console.log("userdb running successfully")
})
.catch(()=>{
    console.log("userdb failed to connect")})


 
    
const UsersSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  status: { type: String, default:"active"},
  orderCount: { type: Number, default: 0 },
  coupons:[
    {
      couponid:{type: mongoose.Schema.Types.ObjectId},
      used:{type:Number}
    }
  ],
  creationdate:{type:Date},
  orderIds: [
    { type: mongoose.Schema.Types.ObjectId,
       ref: 'Order' }
  ], 
  addresses: [{
    name: { type: String, required: true },
    address_label:{ type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    fullAddress: { type: String, required: true },
    pincode: { type:Number, required: true },
    mobile_no:{type:Number,required:true},
    
}],
});

const Users = new mongoose.model('Users', UsersSchema);

module.exports=Users

