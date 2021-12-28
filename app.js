const express = require("express")
const app = express()
const session = require("express-session")
const bodyparser = require("body-parser")
const cookieparser = require("cookie-parser")
const hbs = require("hbs")
const { runInNewContext } = require("vm")

//sql
const path = require('path');
const mysql = require('mysql')

const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')

app.set("view engine", "hbs")

hbs.registerHelper('if_equal', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this)
    } else {
        return opts.inverse(this)
    }
})

app.use(bodyparser.urlencoded({
    extended:false
}))

app.use(session({
    secret: "very secret",
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000 * 60 * 60 
    }
}))

app.use(userRoute)
app.use(adminRoute)
app.use(express.static(__dirname + "/public"))

//connect to SQL
const connection = mysql.createConnection({
    host: 'hermes-eye.c5rtjx1kw1dq.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: '2005B230bc',
    database: 'hermes_eye'
  });

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
});

app.set('views', path.join(__dirname, 'views'));

//   app.get('/', function(req, res) {
//     connection.query("SELECT * FROM trucks", (err, rows) => {
//         if(err) throw err;

//         console.log(rows);
//         res.render('orders', {rows: rows});
//     });
// });



//PREVIOUS CODE BEFORE ROUTES
// app.get("/", (req, res)=>{

//     // if(req.session.email){
//     //     //user already signed in
//     //     res.render("index.hbs", {
//     //         email: req.session.email,
//     //         password: req.session.password
//     //     })
//     // }

//     // else{
//     //     // the user has not registered or logged
//     //     res.render("login.hbs")
    
//     // }
//     res.render("login.hbs")
//     // res.sendFile(__dirname+"/public/login.html")
// })

// app.post("/login", urlencoder, (req,res)=>{
//     let email = req.body.email
//     let password = req.body.password


//     req.session.email = req.body.email
//     req.session.password = req.body.password
//     res.redirect("/home")

//     // User.findOne({email: email, password: password}).then(result=>{
//     //     if(result == null){     
//     //         console.log(result)

//     //         res.render("login.hbs", {
//     //             errors:"Invalid email/password" 
//     //         })
//     //     }
//     //     else{
//     //         req.session.email = req.body.email
//     //         req.session.password = req.body.password

//     //         req.session.firstname = result.firstname
//     //         req.session.lastname = result.lastname
//     //         // console.log("Name is " +result.firstname)

//     //         res.redirect("/")
//     //     }
    
//     // }, (err)=>{
//     //     res.send(err)
//     // }) 
 
// })

// app.get("/home", (req, res)=>{

//     if(req.session.email){        
//         res.render("index.hbs",{
//             email: req.session.email,
//             password: req.session.password
//         })
//     }

//     else{
//         res.render("login.hbs")
//     }
// })

app.listen(3000, function () {
    console.log('Hermes Eye launched on port 3000!');
});