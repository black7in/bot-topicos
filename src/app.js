const express = require("express");
const morgan = require("morgan")
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const config = require('./config');

const app = express();
const routes = require('./routes');

// settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(morgan("dev"));

// routes
app.use(routes);

// mongo

mongoose.connect(config.MONGO_URL)
        .then(() => console.log('DB Conectada.'))
        .catch((err) => console.log('err'));

module.exports = app;