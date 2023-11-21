const express=require("express")
const path = require("path")
const userrouter=require("./routers/userrouter.js")
const session=require("express-session")
const adminrouter=require("./routers/adminrouter.js")
const multer = require('multer');


const app=express()
app.set('view engine', 'ejs');

// Specify the directory where your EJS views are located (userfold in this case)


app.use(express.json());

app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}
));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next()
})
app.use((req, res, next) => {

    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Expires', '-1')
    res.setHeader('Pragma', 'no-chache')
    next()
})


app.use(express.static(path.join(__dirname, "public")))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(adminrouter,userrouter)

 
app.listen(3000,()=>{
    console.log("running successfully")
})


