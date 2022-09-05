const express = require("express");
const morgan = require("morgan")
const bodyParser = require("body-parser");

const app = express();
const routes = require('./routes');

// settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(routes);

module.exports = app;