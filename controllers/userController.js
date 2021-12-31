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

    if(req.session.username){

        connection.query(`SELECT SUM(readStatus) AS notifs FROM adminNotif WHERE username = '${req.session.username}' `, (err, row) => {
            if(err) throw err;
            
            req.session.notifs = row[0].notifs;

            res.render("home.hbs", {
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                notifs : req.session.notifs
            })
        });

    }
    else{
        // the user has not registered or logged
        res.render("login.hbs")

    }

}

exports.getLogin = async (req,res)=>{
    // let username = req.body.username
    // let password = req.body.password
    let remember_me = req.body.remember

    req.session.username = req.body.username
    req.session.password = req.body.password

    if(remember_me){    
        req.session.cookie.maxAge = 1000 * 3600 * 24 * 30
    }

    
    connection.query(`SELECT * FROM users WHERE username = '${req.body.username}' AND password = '${req.body.password}' `, (err, row) => {
        if(err) throw err;

        console.log(row);
        req.session.firstname = row[0].firstname
        req.session.lastname = row[0].lastname

        res.render("home.hbs", {
            firstname: req.session.firstname,
            lastname: req.session.lastname
        })

        res.redirect("/")
    });
    
    
  
}

exports.getHome = (req, res)=>{

    res.redirect("/")
}

exports.getOrders = (req, res)=>{

    res.render("orders.hbs", {
        notifs : req.session.notifs
    })
}

exports.getNotifications = (req, res)=>{

    res.render("notifications.hbs", {
        notifs : 0
    })
}

exports.getProfile = (req, res)=>{

    res.render("profile.hbs", {
        notifs : req.session.notifs
    })
}