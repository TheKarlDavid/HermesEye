const express = require("express")
const app = express()
const path = require('path');
const mysql = require('mysql')
const { body, validationResult } = require('express-validator')
const bcrypt = require("bcryptjs")

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

            if(req.session.isAdmin){
                res.render("home.hbs", {
                    firstname: req.session.firstname,
                    lastname: req.session.lastname,
                    notifs : req.session.notifs
                })
            }
            else{
                res.render("home-client.hbs", {
                    firstname: req.session.firstname,
                    lastname: req.session.lastname,
                    notifs : req.session.notifs
                })
            }   
        });

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

    connection.query(`SELECT firstname, lastname, role, password FROM users WHERE username = '${req.body.username}';`, (err, row) => {
        if(err) throw err;

        // console.log(row);

        if(row.length > 0){
            //FOUND USER
            
            let dbFname = row[0].firstname;
            let dbLname = row[0].lastname;
            let dbRole = row[0].role;
            let dbPassword = row[0].password;

            if(!bcrypt.compareSync(password, dbPassword)) {
                //WRONG PASSWORD

                res.render("login.hbs", {
                    errors:"Invalid email/password" 
                })
            }
            else{
                //RIGHT PASSWORD

                req.session.username = username
                req.session.firstname = dbFname
                req.session.lastname = dbLname
                
                if(dbRole == "Admin"){
                    req.session.isAdmin = true
                }
                else{
                    req.session.isAdmin = false
                }
    
                if(remember_me){    
                    req.session.cookie.maxAge = 1000 * 3600 * 24 * 30
                }
    
                res.redirect("/")
    
            }
        }
        else{
            //FOUND NO USER

            res.render("login.hbs", {
                errors:"Invalid email/password" 
            })
        }

    });
  
}

exports.getHome = (req, res)=>{
    res.redirect("/")
}

exports.getOrders = (req, res)=>{

    if(req.session.username){   

        if(req.session.isAdmin){
            res.render("orders.hbs", {
                notifs : req.session.notifs
            })
        }
        else{
            res.render("orders-client.hbs", {
                notifs : req.session.notifs
            })
        }
        
    }
    else{
        res.redirect("/") 
    }
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

                if(req.session.isAdmin){
                    res.render("notifications.hbs", {
                        notifs : req.session.notifs,
                        notifications: req.session.notifications
                    })
                }
                else{
                    res.render("notifications-client.hbs", {
                        notifs : req.session.notifs,
                        notifications: req.session.notifications
                    })
                }
   
                });
            }
        

        });
    }
    else{
        res.redirect("/") 
    }
    
}

exports.getRegistration = (req, res)=>{

    if(req.session.username){   
        res.render("registration.hbs", {
            notifs : req.session.notifs
        })
    }
    else{
        res.redirect("/") 
    }
}

exports.getRegister = (req, res)=>{

    if(req.session.username){         
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
            res.render("registration.hbs", {
                errors:errors,
                notifs : req.session.notifs
            });
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
        
                connection.query(`SELECT username FROM users WHERE username = "${username}";`, function(err, result){
                    if(err) throw err;
                    
                    if(result.length < 1){ //empty result, no match username
                    //new user logic
                    connection.query(`INSERT INTO hermes_eye.users (userID, username, password, firstname, lastname, role)
                                        VALUES (${newID}, "${username}", "${password}", "${first_name}", "${last_name}", "${role}");`, (err, row) => {
                            if(err) throw err;
            
                            console.log("SUCCESSFULLY REGISTERED UID: " +newID);
            
                            res.render("registration.hbs", {
                                message:"Registration successful",
                                notifs : req.session.notifs
                            })
                        });;
                    }
                    else{ 
                        //existing user
                        console.log("UNSUCCESSFULLY REGISTERED UID: ");
                        res.render("registration.hbs", {
                            errors:"Error in registering: username already in use",
                            notifs : req.session.notifs
                        })                    
                    }
                });
        
            });           
        }
    }
    else{
        res.redirect("/") 
    }

}

exports.getProfile = (req, res)=>{

    if(req.session.username){   
               
        if(req.session.isAdmin){
            res.render("profile.hbs", {
                notifs : req.session.notifs
            })
        }
        else{
            res.render("profile-client.hbs", {
                notifs : req.session.notifs
            })
        }
    }
    else{
        res.redirect("/") 
    }
}

exports.getSignout = (req,res)=>{
    req.session.destroy()
    res.redirect("/")
}