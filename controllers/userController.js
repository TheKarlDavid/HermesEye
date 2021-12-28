// const { body, validationResult } = require('express-validator')
// const bcrypt = require("bcryptjs")
//sql
const express = require("express")
const app = express()
const path = require('path');
const mysql = require('mysql')
app.set('views', path.join(__dirname, 'views'));

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

exports.getIndex = (req, res)=>{

    connection.query("SELECT * FROM users", (err, rows) => {
        if(err) throw err;

        console.log(rows);
        res.render('orders', {rows: rows});
    });

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