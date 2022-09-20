const config = require('../config');
const request = require("request");
const { getResponse } = require('../dialogflow');
const { struct } = require('pb-util');
const { Events } = require('../models/events');
const { Sectors } = require('../models/sectors');


const reservasCollection = new Map();
const userCollection = new Map();

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
    } else {
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
                const message = {
                    text: webhookEvent.postback.payload
                }
                console.log(webhookEvent.postback.payload);
                handleMessage(senderPsid, message);

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
        const result = await getResponse(senderPsid, receivedMessage.text);

        const action = result.action;
        const parameters = struct.decode(result.parameters);
        var text = result.fulfillmentText;
        const outPutParameters = result.outputContexts;

        response = await handleActions(senderPsid, action, parameters, text, outPutParameters);

    } else if (receivedMessage.attachments) {
        response = {
            'text': 'Enviaste un archivo adjunto!'
        };
    }

    callSendAPI(senderPsid, response);
}

async function handleActions(senderPsid, action, parameters, text, outPutParameters) {
    let response;
    let elements = {};
    let key;
    switch (action) {
        case 'action.informacionGeneral':
            const events = await Events.find({});
            key = "elements";
            elements[key] = [];

            for (var i = 0; i < events.length; i++) {
                var data = {
                    "title": events[i].name,
                    "image_url": events[i].thumbnail,
                    "subtitle": events[i].description,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Reservar",
                            "payload": "reservar " + events[i].event
                        },
                        {
                            "type": "postback",
                            "title": "Información",
                            "payload": "informacion de " + events[i].event
                        },
                    ]
                }
                elements[key].push(data);
            }

            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elements.elements
                    }
                }
            }
            break;
        case 'action.informacionXConcierto':
            var event = parameters.Eventos;
            var information = await Events.find({ event: event });

            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": information[0].name,
                                "image_url": information[0].thumbnail,
                                "subtitle": information[0].description,
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Ubicación",
                                        "payload": "lugar " + information[0].event
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Fecha",
                                        "payload": "cuando " + information[0].event
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Precios",
                                        "payload": "precio " + information[0].event
                                    },
                                ]
                            }
                        ]
                    }
                }
            }

            break;
        case 'action.informacionXConcierto.donde':
            var event = parameters.Eventos;
            var information = await Events.find({ event: event });

            response = {
                'text': "El concierto es en la ciudad de " + information[0].city
            };
            break;
        case 'action.informacionXConcierto.cuando':
            var event = parameters.Eventos;
            var information = await Events.find({ event: event });

            response = {
                'text': "La fecha del concierto es el día " + information[0].date
            };
            break;

        case 'action.informacionXConcierto.precio':
            var event = parameters.Eventos;
            var informationSectors = await Sectors.find({ event: event });
            var informationEvents = await Events.find({ event: event });

            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": 'General para ' + informationEvents[0].name,
                                "image_url": 'https://previews.123rf.com/images/vectorplusb/vectorplusb1701/vectorplusb170100247/69994034-insignia-del-metal-de-bronce-moderna-elementos-de-etiqueta-y-diseño-ilustración-vectorial.jpg',
                                "subtitle": 'Precio: ' + informationSectors[0].general.price + ' $',
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Reservar",
                                        "payload": "reservar general " + informationEvents[0].event
                                    },
                                ]
                            },
                            {
                                "title": 'Preferencia para ' + informationEvents[0].name,
                                "image_url": 'https://us.123rf.com/450wm/vectorplusb/vectorplusb1701/vectorplusb170100246/69994033-insignia-de-metal-círculo-plata-moderna-etiqueta-y-elementos-de-diseño-ilustración-vectorial.jpg',
                                "subtitle": 'Precio: ' + informationSectors[0].preference.price + ' $',
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Reservar",
                                        "payload": "reservar preferencia " + informationEvents[0].event
                                    },
                                ]
                            },
                            {
                                "title": 'Vip para ' + informationEvents[0].name,
                                "image_url": 'https://c8.alamy.com/compes/p18kj8/insignia-de-oro-con-cintas-aislado-sobre-fondo-blanco-ilustracion-3d-p18kj8.jpg',
                                "subtitle": 'Precio: ' + informationSectors[0].vip.price + ' $',
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Reservar",
                                        "payload": "reservar vip " + informationEvents[0].event
                                    },
                                ]
                            }
                        ]
                    }
                }
            }
            break;
        case 'action.guardarDatosReserva':
            const oParameters = struct.decode(outPutParameters[1].parameters);
            // Verificar si ya existe un registro de reserva de este usuario.

            reservasCollection.set(senderPsid, [oParameters.Eventos, oParameters.Sectores, oParameters.number]);
            response = {
                'text': text
            };
            break;
        case 'action.EnviarResumenReservaYEsperarConfirmación':
            if (text === 'Por favor confirma tu reserva y datos personales.') {
                userCollection.set(senderPsid, [parameters.person.name, parameters.email]);

                const pedido = reservasCollection.get(senderPsid);
                const user = userCollection.get(senderPsid);

                response = {
                    'text': 'Confirma tu pedido: Evento: ' + pedido[0] + ' Sector: ' + pedido[1] + ' Cantidad: ' + pedido[2]
                };

                /*response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "receipt",
                            "recipient_name": user[0],
                            "order_number": "12345678902",
                            "currency": "USD",
                            "payment_method": "En espera",
                            "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                            "timestamp": "1428444852",
                            "address": {
                                "street_1": "",
                                "street_2": "",
                                "city": "",
                                "postal_code": "",
                                "state": "",
                                "country": ""
                            },
                            "summary": {
                                "total_cost": 56.14
                            },
                            "elements": [
                                {
                                    "title": pedido[0],
                                    "subtitle": pedido[1],
                                    "quantity": pedido[2],
                                    "price": 50,
                                    "currency": "USD",
                                    "image_url": "http://petersapparel.parseapp.com/img/whiteshirt.png"
                                }
                            ]
                        }
                    }
                };*/
            } else {
                response = {
                    'text': text
                };
            }
            break;
        default:
            response = {
                'text': text
            };
            break;
    }

    return response;
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