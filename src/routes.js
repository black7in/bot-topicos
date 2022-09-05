const express = require('express');
const router = express.Router();
const homeController = require('./controllers/home')

//router.get("/", homeController.getHome);
let initWebRoutes = (app) => {
    router.get("/", homeController.getHome);

    return app.use("/", router)
};

module.exports = initWebRoutes;