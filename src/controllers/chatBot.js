const config = require('../config')
const request = require("request");

const getWebhook = (req, res) => {  
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.VERIFICATION_TOKEN) {

            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            res.sendStatus(403);
        }
    }else{
        res.send('No tienes permisos para ver esta página.')
    }
};

const postWebhook = (req, res) => {  
    let body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhookEvent = entry.messaging[0];
            let senderPsid = webhookEvent.sender.id;

            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);
            } else if (webhookEvent.postback) {
                handlePostback(senderPsid, webhookEvent.postback);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

// Handles messages events
async function handleMessage(senderPsid, receivedMessage) {
    let response;

    if (receivedMessage.text) {

        const respuesta = receivedMessage.text;
        response = {
            'text': respuesta
        };

    } else if (receivedMessage.attachments) {
        response = {
            'text': 'Enviaste un archivo adjunto!'
        };
    }

    callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
    let response;

    let payload = receivedPostback.payload;

    if (payload === 'yes') {
        response = { 'text': 'Thanks!' };
    } else if (payload === 'no') {
        response = { 'text': 'Oops, try sending another image.' };
    }
    
    callSendAPI(senderPsid, response);
}

function callSendAPI(senderPsid, response) {
    let requestBody = {
        'recipient': {
            'id': senderPsid
        },
        'message': response
    };
    request({
        'uri': 'https://graph.facebook.com/v2.6/me/messages',
        'qs': { 'access_token': config.PAGE_ACCESS_TOKEN },
        'method': 'POST',
        'json': requestBody
    }, (err, _res, _body) => {
        if (!err) {
            console.log('Mensaje enviado!');
        } else {
            console.error('Error al enviar mensaje:' + err);
        }
    });
}

module.exports = {
    getWebhook,
    postWebhook
}