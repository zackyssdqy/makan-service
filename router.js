const express = require('express')
const masterController = require('./controllers')
const route = express.Router();
route.use(express.urlencoded({ extended: false }));

route.get(`/find`, masterController.find)

module.exports = route;
