'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');

class SocketioInterface {
    constructor(ioConnection) {
        this.ioConnection = ioConnection;
        this.app = express();
        this.initRoutes();
    }

    getGeneratedRooms() {
        // generated rooms are rooms created manually
        // it does not include the default socketid rooms
        const generatedRooms = [];
        const rooms = this.ioConnection.sockets.adapter.rooms;
        return Object.keys(rooms).filter(room => {
            return (!rooms[room].sockets[room]);
        });
    }

    msToTime(t) {
        const ms = t % 1000;
        t = (t - ms) / 1000;
        const secs = t % 60;
        t = (t - secs) / 60;
        const mins = t % 60;
        const hrs = (t - mins) / 60;

        return hrs + ':' + mins + ':' + secs + '.' + ms;
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

        this.app.get('/sockets/:id', (req, res) => {
            if (this.ioConnection.sockets.adapter.nsp.sockets) {
                const socket = this.ioConnection.sockets.adapter.nsp.sockets[req.params.id];
                res.setHeader('Content-Type', 'text/plain');
                res.send(util.inspect(socket));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/sockets/:id/uptime', (req, res) => {
            if (this.ioConnection.sockets.adapter.nsp.sockets) {
                const socket = this.ioConnection.sockets.adapter.nsp.sockets[req.params.id];
                const uptime = Date.now() - socket.handshake.issued;
                res.send(this.msToTime(uptime));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/rooms/json', (req, res) => {
            if (this.ioConnection.sockets.adapter.rooms) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(this.getGeneratedRooms()));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/rooms/total', (req, res) => {
            if (this.ioConnection.sockets.adapter.rooms) {
                res.setHeader('Content-Type', 'application/json');
                const totalRooms = this.getGeneratedRooms().length;
                res.send(totalRooms.toString());
            } else {
                res.send('ERR');
            }
        });


    }

}

module.exports = SocketioInterface;
