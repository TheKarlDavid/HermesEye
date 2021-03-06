// starting page
const express = require("express")
const app = express()
const session = require("express-session")
const bodyparser = require("body-parser")
const cookieparser = require("cookie-parser")
const hbs = require("hbs")
const { runInNewContext } = require("vm")

const userRoute = require('./routes/userRoute')
const clientRoute = require('./routes/clientRoute')

app.set("view engine", "hbs")

hbs.registerHelper('if_greater', function(a, b, opts) {
    if (a > b) {
        return opts.fn(this)
    } else {
        return opts.inverse(this)
    }
})

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

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
app.use(clientRoute)
app.use(express.static(__dirname + "/public"))

app.listen(3000, function () {
    console.log('Hermes Eye launched on port 3000!');
});