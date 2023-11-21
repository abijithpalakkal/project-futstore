const nodemailer=require("nodemailer")
const express=require("express")


function sendotp(email,OTP){
 
 // Define mailOptions for OTP email
 const mailOptions = {
   from: process.env.DB_USERNAME,
   to: email,
   subject: "Your OTP Code futstore",
   text: `Your OTP code is: ${OTP}`,
 };

 // Create a transporter for sending emails
 let transporter = nodemailer.createTransport({
   service: "gmail", // Corrected service name
   auth: {
     user: process.env.DB_USERNAME,
     pass: process.env.DB_APPPASSWORD,
   }
});
   transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
    } else {
      console.log("OTP sent:", info.response);
    }
  
});
}
module.exports={sendotp}