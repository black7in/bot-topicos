const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const config = require('./config');
const sessionId = uuid.v4();

const projectId = config.GOOGLE_PROJECT_ID;

const sessionClient = new dialogflow.SessionsClient({
    projectId,
    credentials: {
        client_email: config.GOOGLE_CLIENT_MAIL,
        private_key: config.GOOGLE_PRIVATE_KEY
    }
});

const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
);

async function getResponse(texto){
    const request = {
        session: sessionPath,
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
    
    return result.fulfillmentText
}

module.exports = {
    getResponse
}