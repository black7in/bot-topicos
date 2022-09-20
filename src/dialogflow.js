const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const config = require('./config');
const { struct } = require('pb-util');

const projectId = config.GOOGLE_PROJECT_ID;

const sessionClient = new dialogflow.SessionsClient({
    projectId,
    credentials: {
        client_email: config.GOOGLE_CLIENT_MAIL,
        private_key: config.GOOGLE_PRIVATE_KEY
    }
});


const sessionsId = new Map();
const messageTimes = new Map();


async function getResponse(senderPsid, texto) {
    if (messageTimes.has(senderPsid)) {
        if ((Date.now() - messageTimes.get(senderPsid)) - config.TIME_AFK >= 0) {
            sessionsId.delete(senderPsid);
            messageTimes.delete(senderPsid);
        }
    }

    if (sessionsId.has(senderPsid) == false) {
        const sessionId = uuid.v4();
        const sessionPath = sessionClient.projectAgentSessionPath(
            projectId,
            sessionId
        );

        sessionsId.set(senderPsid, sessionPath);
    }

    const request = {
        session: sessionsId.get(senderPsid),
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: texto,
                // The language used by the client (en-US)
                languageCode: 'es-ES',
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);

    const result = responses[0].queryResult;
    //console.log(result);
    //console.log('Respuesta: ' + result.fulfillmentText);
    //console.log('ContextoSalida: ' + result.outputContexts);
    //const param = struct.decode(result.parameters);
    //console.log(param);
    //console.log('Parametros: '+ param.number);

    //const intent = struct.decode(result.intent);
    //console.log(result.intent.displayName);

    messageTimes.set(senderPsid, Date.now());
    return result;
}

module.exports = {
    getResponse
}