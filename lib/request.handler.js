'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const session = require('express-session');
const cookieParser = require('cookie-parser');

class SocketioInterface {
    constructor(ioConnection, config) {
        this.ioConnection = ioConnection;
        this.config = config;

        // init express app
        this.app = express();

        //use body parser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        // serve static files from public dir
        this.app.use(express.static(path.join(__dirname, 'public')));

        // use sessions for auth
        this.app.use(cookieParser());
        this.app.use(session({
            secret: 'socket-interface-secret',
            resave: true,
            saveUninitialized: true
        }));

        // init routes last
        this.initRoutes();

    }

    auth(req, res, next) {
        if (req.session && req.session.admin === true) {
            return next();
        } else {
            return res.sendStatus(401);
        }
    }

    login(req) {
        if (req.body.password === this.config.password) {
            req.session.admin = true;
        } else {
            req.session.admin = false;
        }

        return req.session.admin;
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

        this.app.post('/login', (req, res) => {
            const loggedIn = this.login(req);
            if (loggedIn) {
                res.redirect('/sockets/total');
            } else {
                return res.sendStatus(401);
            }
        });

        this.app.get('/login', (req, res) => {
            res.sendFile(path.join(__dirname + '/public/login.html'));
        });

        this.app.get('/sockets/json', this.auth, (req, res) => {
            if (this.ioConnection.sockets.sockets) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(Object.keys(this.ioConnection.sockets.sockets)));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/sockets/total', this.auth, (req, res) => {
            if (this.ioConnection.sockets.sockets) {
                res.setHeader('Content-Type', 'application/json');
                const totalSockets = Object.keys(this.ioConnection.sockets.sockets).length;
                res.send(totalSockets.toString());
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/sockets/:id', this.auth, (req, res) => {
            if (this.ioConnection.sockets.adapter.nsp.sockets) {
                const socket = this.ioConnection.sockets.adapter.nsp.sockets[req.params.id];
                res.setHeader('Content-Type', 'text/plain');
                res.send(util.inspect(socket));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/sockets/:id/uptime', this.auth, (req, res) => {
            if (this.ioConnection.sockets.adapter.nsp.sockets) {
                const socket = this.ioConnection.sockets.adapter.nsp.sockets[req.params.id];
                const uptime = Date.now() - socket.handshake.issued;
                res.send(this.msToTime(uptime));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/rooms/json', this.auth, (req, res) => {
            if (this.ioConnection.sockets.adapter.rooms) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(this.getGeneratedRooms()));
            } else {
                res.send('ERR');
            }
        });

        this.app.get('/rooms/total', this.auth, (req, res) => {
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
