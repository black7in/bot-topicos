const config = require('../config');
const request = require("request");
const axios = require("axios");
const { getResponse } = require('../dialogflow');
const { struct } = require('pb-util');
const { messageTimes } = require('../maps');
const Prospecto = require('../models/prospecto')
const Visita = require('../models/visita');
const Stock = require('../models/stock');
const Deporte = require('../models/deporte');
const Calzado = require('../models/calzado');
const Marca = require('../models/marca');
const Color = require('../models/color');
const Consulta = require('../models/consulta');

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
                var message = {
                    text: webhookEvent.postback.payload
                }
                handleMessage(senderPsid, message);
            } else if (webhookEvent.messaging_feedback) {
                const messaging_feedback = webhookEvent.messaging_feedback;
                const calificacion = messaging_feedback.feedback_screens[0].questions.hauydmns8;
                Visita.guardarCalificacion(senderPsid, calificacion.payload);
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
            phone: '',
        })

        await nuevoProspecto.save(function (err) {
            if (err) return handleError(err);
            const nuevaVisita = new Visita({
                prospecto: nuevoProspecto._id,
                facebookId: senderPsid,
                first_name: datosUsuario.first_name,
                last_name: datosUsuario.last_name,
                email: '',
                phone: '',
                calificacion: ''
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
                phone: '',
                calificacion: ''
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

        response = await handleActions(senderPsid, text, action, parameters, outPutParameters);

    } else if (receivedMessage.attachments) {
        response = {
            'text': 'Enviaste un archivo adjunto!'
        };
    }
    callSendAPI(senderPsid, response);
}
async function crearCarruselDeCalzados(stockCalzados) {
    let response;
    if (stockCalzados.length > 0) {
        var elements = {};
        var key;
        key = "elements";
        elements[key] = [];
        for (var i = 0; i < stockCalzados.length; i++) {
            if (Stock.hasCantidadDisponible(stockCalzados[i].talla)) { // Agregar
                var infoCalzado = await Calzado.findOne({ _id: stockCalzados[i].calzado });
                var marca = await Marca.findOne({ _id: infoCalzado.marca });
                var color = await Color.findOne({ _id: infoCalzado.color[0] });

                var data = {
                    "title": marca.nombre + ' ' + infoCalzado.modelo,
                    "image_url": infoCalzado.imagen[0],
                    "subtitle": 'Precio: ' + stockCalzados[i].precio + '\nColor: ' + color.nombre + '\nGenero: ' + infoCalzado.genero,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Mas Imagenes",
                            "payload": "imagenes de " + infoCalzado.modelo
                        },
                        {
                            "type": "postback",
                            "title": "Comprar",
                            "payload": "comprar " + infoCalzado.modelo
                        },
                    ]
                }
                elements[key].push(data);
            }
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
    } else {
        response = null
    }

    return response;
}

async function handleActions(senderPsid, text, action, parameters, outPutParameters) {
    let response;

    switch (action) {
        case 'action.enviarListaDeZapatosParaXDeporte':
            var nombreDeporte = parameters.deporte;
            if (nombreDeporte) {
                var stockCalzados = await Stock.getListaDeCalzadosParaDeporte(nombreDeporte);
                response = await crearCarruselDeCalzados(stockCalzados);
            }
            callSendAPI(senderPsid, { text: text });
            Consulta.registrarDeporte(senderPsid, nombreDeporte);
            break;
        case 'action.enviarListaDeZaptosParaXDeporteYColor':
            var nombreDeporte = parameters.deporte;
            var color = parameters.color;
            color = color.charAt(0).toUpperCase() + color.slice(1);
            if (nombreDeporte) {
                var stockCalzados = await Stock.getListaDeCalzadosParaDeportePorColor(nombreDeporte, color);
                response = await crearCarruselDeCalzados(stockCalzados);
                if (!response) {
                    text = "Lo lamento no contamos con calzados con estas caracteristicas."
                }
                await Consulta.registrarDeporte(senderPsid, nombreDeporte);
                await Consulta.registrarColor(senderPsid, color);
            }
            callSendAPI(senderPsid, { text: text })
            break;
        case 'action.enviarListaDeZaptosParaXDeporteYGenero':
            var nombreDeporte = parameters.deporte;
            var genero = parameters.genero;
            if (nombreDeporte) {
                var stockCalzados = await Stock.getListaDeCalzadosParaDeportePorGenero(nombreDeporte, genero);
                response = await crearCarruselDeCalzados(stockCalzados);
                if (!response) {
                    text = "Lo lamento no contamos con calzados con estas caracteristicas."
                }
                await Consulta.registrarDeporte(senderPsid, nombreDeporte);
                await Consulta.registrarGenero(senderPsid, genero);
            }
            callSendAPI(senderPsid, { text: text })
            break;
        case 'action.enviarListaDeZaptosParaXDeporteYMarca':
            var nombreDeporte = parameters.deporte;
            var marca = parameters.marca;
            if (nombreDeporte) {
                var stockCalzados = await Stock.getListaDeCalzadosParaDeportePorMarca(nombreDeporte, marca);
                response = await crearCarruselDeCalzados(stockCalzados);
                if (!response) {
                    text = "Lo lamento no contamos con calzados con estas caracteristicas."
                }
                await Consulta.registrarDeporte(senderPsid, nombreDeporte);
                await Consulta.registrarMarca(senderPsid, marca);
            }
            callSendAPI(senderPsid, { text: text })
            break;
        case 'action.enviarListaDeZaptosParaXDeporteYMarcaZColor':
            var nombreDeporte = parameters.deporte;
            var marca = parameters.marca;
            var color = parameters.color;
            color = color.charAt(0).toUpperCase() + color.slice(1);
            if (nombreDeporte) {
                var stockCalzados = await Stock.getListaDeCalzadosParaDeportePorMarcaYColor(nombreDeporte, marca, color);
                response = await crearCarruselDeCalzados(stockCalzados);
                if (!response) {
                    text = "Lo lamento no contamos con calzados para estas caracteristicas."
                }
                await Consulta.registrarDeporte(senderPsid, nombreDeporte);
                await Consulta.registrarColor(senderPsid, color);
                await Consulta.registrarMarca(senderPsid, marca);
            }
            callSendAPI(senderPsid, { text: text })
            break;
        case 'action.enviarListaDeZaptosParaXDeporteYMarcaZGenero':
            var nombreDeporte = parameters.deporte;
            var marca = parameters.marca;
            var genero = parameters.genero;
            if (nombreDeporte) {
                var stockCalzados = await Stock.getListaDeCalzadosParaDeportePorMarcaYGenero(nombreDeporte, marca, genero);
                response = await crearCarruselDeCalzados(stockCalzados);
                if (!response) {
                    text = "Lo lamento no contamos con calzados para estas caracteristicas."
                }
                await Consulta.registrarDeporte(senderPsid, nombreDeporte);
                await Consulta.registrarGenero(senderPsid, genero);
                await Consulta.registrarMarca(senderPsid, marca);

            }
            callSendAPI(senderPsid, { text: text })
            break;
        // AQUI ENTRAN MAS ACCIONES PARA ENVIAR LISTA


        case 'action.enviarListaDeImagenes':
            var modelo = parameters.modelo;
            var images = await Calzado.getImages(modelo);
            if (images) {
                var elements = {};
                var key;
                key = "elements";
                elements[key] = [];
                for (var i = 0; i < images.length; i++) {
                    var data = {
                        "title": modelo,
                        "image_url": images[i],
                        "subtitle": "",
                        "default_action": {
                            "type": "web_url",
                            "url": images[i],
                            "webview_height_ratio": "full",
                        },
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Comprar",
                                "payload": "comprar " + modelo
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
            } else {
                response = {
                    'text': 'Lo siento no encontré informacion de tal model.'
                }
            }
            break;
        case 'action.comprarModelo':
            var modelo = parameters.modelo;
            var talla = parameters.number;
            if (talla) {
                // Verificar si está disponible en esa talla
                var calzado = await Calzado.findOne({ modelo: modelo });
                var estaDisponible = await Stock.hasTallaDisponible(calzado._id, talla);
                if (estaDisponible) {
                    // Capturar modelo y talla
                    response = {
                        'text': text
                    }

                } else {
                    response = {
                        'text': 'Lo siento no tenemos talla ' + talla + ' para este producto. Por favor intenta con otro modelo.'
                    }
                }
            } else {
                response = {
                    'text': text
                }
            }
            break;
        case 'action.registrarNombre':
            var name = parameters.person.name;
            if (name) {
                // Registrar Nombre de la persona.
                response = {
                    'text': text
                }
            } else {
                response = {
                    'text': text
                }
            }
            break;
        case 'action.registrarNumero':
            var phone = parameters.number;
            if (phone) {
                // Registrar numero de la persona.
                response = {
                    'text': text
                }
            } else {
                response = {
                    'text': text
                }
            }
            break;
        case 'action.registrarCorreo':
            var correo = parameters.email;
            if (correo) {
                // Regisrar Correo
                response = {
                    'text': text
                }
            } else {
                response = {
                    'text': text
                }
            }
            break;
        case 'action.registrarCiudad':
            var ciudad = parameters.location;
            if (ciudad) {
                // Regisrar Correo
                response = {
                    'text': text
                }
            } else {
                response = {
                    'text': text
                }
            }
            break;
        case 'action.enviarFormularioDeCalificación':
            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "customer_feedback",
                        "title": "Ingresa tu Calificación", // Business needs to define. 
                        "subtitle": "Tu calificación me ayuda a mejorar.", // Business needs to define. 
                        "button_title": "Calificar", // Business needs to define. 
                        "feedback_screens": [{
                            "questions": [{
                                "id": "hauydmns8", // Unique id for question that business sets
                                "type": "csat",
                                "title": "¿Cómo calificaría su experiencia al interactuar conmigo?", // Optional. If business does not define, we show standard text. Standard text based on question type ("csat", "nps", "ces" >>> "text")
                                "score_label": "neg_pos", // Optional
                                "score_option": "five_stars", // Optional
                            }]
                        }],
                        "business_privacy":
                        {
                            "url": "https://www.example.com"
                        },
                        "expires_in_days": 3 // Optional, default 1 day, business defines 1-7 days
                    }
                }
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