const app = require('./src/app');
const fs = require('fs');
const https = require('https');

async function main() {
    //app.listen((process.env.PORT || 5000), () => console.log('El servidor esta escchando!'));
    console.clear();
    const httpsOptions = {
        key: fs.readFileSync(require.resolve('./src/cert/private.key')),
        cert: fs.readFileSync(require.resolve('./src/cert/cert.pem'))
    };
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(443, () => console.log('El servidor esta listo.'));
}
main();