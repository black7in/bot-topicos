const express = require("express");
const morgan = require("morgan")
const bodyParser = require("body-parser");

const app = express();
//const initWebRoutes = require('./routes');

// settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

const homeController = require('./controllers/home')
app.get("/", homeController.getHome);

//initWebRoutes(app);

module.exports = app;