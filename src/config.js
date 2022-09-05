const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    // fb credentials
    VERIFICATION_TOKEN: process.env.VERIFICATION_TOKEN || '',
    PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN || ''

    // google credentials



}