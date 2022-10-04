const config = require('../config');
const request = require("request");
const axios = require("axios");
const { getResponse } = require('../dialogflow');
const { struct } = require('pb-util');
const Concierto = require('../models/concierto');
const Prospecto = require('../models/prospecto')
const Artista = require('../models/artista');
const Visita = require('../models/visita');
const { messageTimes } = require('../maps');
const { VERIFICATION_TOKEN } = require('../config');
const Escenario = require('../models/escenario');
const Interes = require('../models/interes');

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

    // Verificar si el usuario ya esta en Prospecto
    const usuarioEstaEnProspecto = await Prospecto.findOne({ facebookId: senderPsid });
    if (!usuarioEstaEnProspecto) {
        // Obtener datos del nuevo cliente
        const datosUsuario = await getUserData(senderPsid);
        // Crear nuevo prospecto y visita, con todos los datos obtenidos.
        const nuevoProspecto = new Prospecto({
            facebookId: senderPsid,
            first_name: datosUsuario.first_name,
            last_name: datosUsuario.last_name,
            email: '',
            phone: ''
        })

        await nuevoProspecto.save(function (err) {
            if (err) return handleError(err);
            const nuevaVisita = new Visita({
                prospecto: nuevoProspecto._id,
                facebookId: senderPsid,
                first_name: datosUsuario.first_name,
                last_name: datosUsuario.last_name,
                email: '',
                phone: ''
            });

            nuevaVisita.save();
        });
    } else { // CREAR NUEVA VISITA
        if (!messageTimes.has(senderPsid) || (Date.now() - messageTimes.get(senderPsid)) - config.TIME_AFK >= 0) {
            const datosUsuario = await getUserData(senderPsid);
            const nuevaVisita = new Visita({
                prospecto: usuarioEstaEnProspecto._id,
                facebookId: senderPsid,
                first_name: datosUsuario.first_name,
                last_name: datosUsuario.last_name,
                email: '',
                phone: ''
            });
            await nuevaVisita.save();
        }
    }

    if (receivedMessage.text) {
        var result = await getResponse(senderPsid, receivedMessage.text);
        var action = result.action;
        var parameters = struct.decode(result.parameters);
        var text = result.fulfillmentText;
        var outPutParameters = result.outputContexts;

        response = await handleActions(senderPsid, action, parameters, text, outPutParameters);

    } else if (receivedMessage.attachments) {
        response = {
            'text': 'Enviaste un archivo adjunto!'
        };
    }
    callSendAPI(senderPsid, response);
}

function armarCarruselDeConciertos() {


}

async function handleActions(senderPsid, action, parameters, text, outPutParameters) {
    let response;

    switch (action) {
        case 'action.informacionTodosLosDisponibles':
            var concierto = await Concierto.obtenerTodosDisponibles();
            var elements = {};
            var key;
            key = "elements";
            elements[key] = [];
            for (var i = 0; i < concierto.length; i++) {
                var data = {
                    "title": concierto[i].nombre,
                    "image_url": concierto[i].banner,
                    "subtitle": concierto[i].descripcion,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Reservar",
                            "payload": "reservar " + concierto[i].nombre
                        },
                        {
                            "type": "postback",
                            "title": "Detalles",
                            "payload": "informacion de " + concierto[i].nombre
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
            callSendAPI(senderPsid, { text: text })
            break;
        case 'action.informacionConParametrosArtista':
            //Nombre del artista
            var nombreArtista = parameters.artista;
            var concierto = await Concierto.obtenerConciertoDisponiblePorArtista(nombreArtista);
            var elements = {};
            var key;
            key = "elements";
            elements[key] = [];
            for (var i = 0; i < concierto.length; i++) {
                var data = {
                    "title": concierto[i].nombre,
                    "image_url": concierto[i].banner,
                    "subtitle": concierto[i].descripcion,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Reservar",
                            "payload": "reservar " + concierto[i].nombre
                        },
                        {
                            "type": "postback",
                            "title": "Detalles",
                            "payload": "informacion de " + concierto[i].nombre
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
            callSendAPI(senderPsid, { text: text })
            await Interes.registrarArtista(senderPsid, nombreArtista);
            break;
        case 'action.informacionConParametrosCiudad':
            const ciudad = parameters.ciudad;
            var concierto = await Concierto.obtenerConciertoDosponiblePorCiudad(ciudad);
            var elements = {};
            var key;
            key = "elements";
            elements[key] = [];
            for (var i = 0; i < concierto.length; i++) {
                var data = {
                    "title": concierto[i].nombre,
                    "image_url": concierto[i].banner,
                    "subtitle": concierto[i].descripcion,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Reservar",
                            "payload": "reservar " + concierto[i].nombre
                        },
                        {
                            "type": "postback",
                            "title": "Detalles",
                            "payload": "informacion de " + concierto[i].nombre
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
            callSendAPI(senderPsid, { text: text })
            await Interes.registrarCiudad(senderPsid, ciudad);
            break;
        case 'action.informacionConParametrosTiempo':
            // var time = parameters.date-time;
            console.log(parameters);

            response = {
                'text': "La fecha del concierto es el día"
            };
            break;
        case 'action.informacionDondeConciertoArtista':
            var nombreArtista = parameters.artista;

            response = {
                text: 'El concierto\n será en\n'
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

async function getUserData(senderPsid) {
    let access_token = config.PAGE_ACCESS_TOKEN;
    try {
        let userData = await axios.get(
            'https://graph.facebook.com/v2.6/' + senderPsid + '?',
            {
                params: {
                    access_token,
                },
            }
        );
        return userData.data;
    } catch (err) {
        console.log("Algo salio mal en axios getUserData: ", err);
        return {
            first_name: "",
            last_name: "",
            profile_pic: "",
        };
    }
}

module.exports = {
    getWebhook,
    postWebhook
}