const { body, validationResult } = require('express-validator')
const bcrypt = require("bcryptjs")
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

    // connection.query(`SELECT MAX(userID)+1 AS newID FROM users;`, (err, row) => {
    //     if(err) throw err;

    //     let newID = row[0].newID;
    //     console.log(newID);
    // });
    
    // connection.query(`SELECT username FROM users WHERE username = "fredte";`, function(err, result, field){

    //     console.log(result)
        
    //     if(result.length === 0){
    //        //new user logic
    //     //    connection.query(`INSERT INTO hermes_eye.users (userID, username, password, firstname, lastname, role)
    //     //                     VALUES (${newID}, "fredtes", "we", "fn", "fnf", "Admin");`, (err, row) => {
    //     //         if(err) throw err;

    //     //         console.log("SUCCESSFULLY REGISTERED UID: " +newID);

    //     //         res.render("registration.hbs", {
    //     //             message:"Registration successful"
    //     //         })
    //     //     });
    //      //   console.log("SUCCESSFULLY REGISTERED UID: " +newID);
    //     }
    //     else{  
    //         //existing user
    //         res.render("registration.hbs", {
    //             errors:"Error in registering: username already in use"
    //         })
    //     }
    // });  
//
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

// update notification status
let data = [false, 1];

exports.getNotifications = (req, res)=>{

    if(req.session.username){   
        connection.query(`SELECT orderID, status, readStatus 
                        FROM hermes_eye.adminNotif
                        WHERE username="${req.session.username}"
                        AND readStatus <> 0
                        ORDER BY notifID DESC;`, (err, rows) => {
            if(err) throw err;
            
            req.session.notifications = rows
                            
            if(!req.session.notifications.isEmpty){
            // execute the UPDATE statement
            connection.query(`UPDATE hermes_eye.adminNotif
                            SET readStatus = 0
                            WHERE username="${req.session.username}";`, data, (error, results, fields) => {
                if (error){
                    return console.error(error.message);
                }

                console.log('Rows affected:', results.affectedRows);
                req.session.notifs = 0;

                    res.render("notifications.hbs", {
                        notifs : req.session.notifs,
                        notifications: req.session.notifications
        
                    })
                });
            }
        

        });
    }
    else{
        res.redirect("/") 
    }
    
}

exports.getRegistration = (req, res)=>{

    res.render("registration.hbs", {
        notifs : req.session.notifs
    })
}

exports.getRegister = (req, res)=>{

    // reading fields from hbs
    let username = req.body.un
    let password = req.body.pw
    let first_name = req.body.firstname
    let last_name = req.body.lastname
    let role = req.body.role

    //checking if valid
    body("username").notEmpty();
    body("password").notEmpty();
    body("password").isLength({min:8});
    body("first_name").notEmpty();
    body("last_name").notEmpty();
    body("role").notEmpty();
    

    //check errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render("registration.hbs",{errors:errors});
    }
    else{

        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password,salt);
        password = hash;

        //save user to db
        connection.query(`SELECT MAX(userID)+1 AS newID FROM users;`, (err, row) => {
            if(err) throw err;

            let newID = row[0].newID;
            console.log(newID);
        });
        
        connection.query(`SELECT username FROM users WHERE username = "${username}";`, function(err, result, field){
            if(result.length === 0){
               //new user logic
               connection.query(`INSERT INTO hermes_eye.users (userID, username, password, firstname, lastname, role)
                                VALUES (${newID}, "${username}", "${password}", "${first_name}", "${last_name}", "${role}");`, (err, row) => {
                    if(err) throw err;

                    console.log("SUCCESSFULLY REGISTERED UID: " +newID);

                    res.render("registration.hbs", {
                        message:"Registration successful"
                    })
                });
            }
            else{  
                //existing user
                res.render("registration.hbs", {
                    errors:"Error in registering: username already in use"
                })
            }
        });

        

        // user.save().then((doc)=>{
        //     console.log("Succesfully added: "+ doc)
        //     res.render("login.hbs", {
        //     message:"Registration successful"
        //     })
        // }, (err)=>{
        //     console.log("Error in adding " + err)
        //     res.render("login.hbs", {
        //         errors:"Error in registering: email already in use"
        //     })
        // })
        
    }
}

exports.getProfile = (req, res)=>{

    res.render("profile.hbs", {
        notifs : req.session.notifs
    })
}