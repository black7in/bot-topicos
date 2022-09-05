const express = require("express");
const morgan = require("morgan")
const bodyParser = require("body-parser");

const test = require('../google-credentials.json')

console.log(test);

const app = express();
const routes = require('./routes');

// settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

// routes
app.use(routes);

module.exports = app;