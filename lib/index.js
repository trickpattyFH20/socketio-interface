'use strict';

const http = require('http');
const https = require('https');
const RequestHandler = require('./request.handler')

const socketioInterface = function(ioConnection, config = {}) {
    const handler = new RequestHandler(ioConnection);
    const httpsPort = config.port || 13333;

    http.createServer(handler.app).listen(httpsPort);
    console.log('http socketio interface listening on *:' + httpsPort);

    if (config.ssl) {
        https.createServer({
            key: config.ssl.key,
            cert: config.ssl.cert
        }, handler.app)
        .listen(config.ssl.port);
        console.log('https socketio interface listening on *:' + config.ssl.port);
    }
}

module.exports = socketioInterface;
