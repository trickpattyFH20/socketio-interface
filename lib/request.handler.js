'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

class SocketioInterface {
    constructor(ioConnection) {
        this.ioConnection = ioConnection;
        this.app = express();
        this.initRoutes();
    }

    initRoutes() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(express.static(path.join(__dirname, 'public')));

        this.app.get('/rooms', (req, res) => {
            res.send('TODO render with template view')
        });

        this.app.get('/sockets/json', (req, res) => {
            if (this.ioConnection.sockets.sockets) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(Object.keys(this.ioConnection.sockets.sockets)));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/sockets/total', (req, res) => {
            if (this.ioConnection.sockets.sockets) {
                res.setHeader('Content-Type', 'application/json');
                const totalSockets = Object.keys(this.ioConnection.sockets.sockets).length;
                res.send(totalSockets.toString());
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/rooms/json', (req, res) => {
            if (this.ioConnection.sockets.adapter.rooms) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(Object.keys(this.ioConnection.sockets.adapter.rooms)));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/rooms/total', (req, res) => {
            if (this.ioConnection.sockets.adapter.rooms) {
                res.setHeader('Content-Type', 'application/json');
                const totalRooms = Object.keys(this.ioConnection.sockets.adapter.rooms).length;
                res.send(totalRooms.toString());
            } else {
                res.send('ERR');
            }
        });

    }

}

module.exports = SocketioInterface;
