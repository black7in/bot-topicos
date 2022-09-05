const express = require('express');
const router = express.Router();
const homeController = require('./controllers/home');
const chatBotCOntroller = require('./controllers/chatBot');

router.get("/", homeController.getHome);
router.get("/webhook", chatBotCOntroller.getWebhook);
router.post("/webhook", chatBotCOntroller.postWebhook);

module.exports = router;