const express = require('express')
const userController = require('../controllers/userController')
const routes = express();

routes.get("/", userController.getIndex)
routes.post("/login", userController.getLogin)
routes.get("/home", userController.getHome)
routes.get("/orders", userController.getOrders)
routes.get("/notifications", userController.getNotifications)
routes.get("/registration", userController.getRegistration)
routes.post("/register", userController.getRegister)
routes.get("/profile", userController.getProfile)

module.exports = routes