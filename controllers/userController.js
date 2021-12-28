// const { body, validationResult } = require('express-validator')
// const bcrypt = require("bcryptjs")

exports.getIndex = (req, res)=>{

    if(req.session.username){

        res.render("home.hbs", {
            username: req.session.username,
            password: req.session.password
        })
    }
    else{
        // the user has not registered or logged
        res.render("login.hbs")

    }

}

exports.getLogin = async (req,res)=>{
    let username = req.body.username
    let password = req.body.password
    let remember_me = req.body.remember

    req.session.username = req.body.username
    req.session.password = req.body.password

    if(remember_me){    
        req.session.cookie.maxAge = 1000 * 3600 * 24 * 30
    }
    
    res.redirect("/")
  
}

exports.getHome = (req, res)=>{

    res.redirect("/")
}

exports.getOrders = (req, res)=>{

    res.render("orders.hbs")
}

exports.getNotifications = (req, res)=>{

    res.render("notifications.hbs")
}

exports.getProfile = (req, res)=>{

    res.render("profile.hbs")
}