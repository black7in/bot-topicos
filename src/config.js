const dotenv = require('dotenv');
dotenv.config();

const googleCredentials = require('../google-credentials.json');

module.exports = {
    // fb credentials
    VERIFICATION_TOKEN: process.env.VERIFICATION_TOKEN || '',
    PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN || '',

    // google credentials
    GOOGLE_PROJECT_ID: googleCredentials.project_id || '',
    GOOGLE_PRIVATE_KEY: googleCredentials.private_key || '',
    GOOGLE_CLIENT_MAIL: googleCredentials.client_email || ''
}