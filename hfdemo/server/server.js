/**
 * Created by Administrator on 2015/1/28.
 */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var Emitter = require('component-emitter');

app.use(express.static(path.join(__dirname, '../static')));

app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.removeHeader('X-Powered-By');
    next();
});

var p2p = {};
var num2p = [];

function getIdByNum(index) {
    return num2p[index];
}

io.on('connection', function (socket) {
    socket.on('getId', function (e) {
        num2p.push(socket.id);
        var myId = num2p.length - 1;
        socket.selfId = myId;
        socket.emit('getId', {
            id: myId
        });
    });
    socket.on('setId', function (e) {
        console.log(e.id);
        p2p[socket.id] = getIdByNum(e.id)
    });
    socket.on('SSetOtherId', function (e) {
        var otherId = getIdByNum(e.id);
        p2p[socket.id] = otherId;
        p2p[otherId] = socket.id;
        socket.to(p2p[socket.id]).emit('CSetRemoteId', {
            id: socket.selfId
        });
    });
    socket.on('SNeedPeer', function (e) {
        console.log(p2p[socket.id]);
        socket.to(p2p[socket.id]).emit('CNeedPeer', e);
    });
    socket.on('SOffer', function (e) {
        socket.to(p2p[socket.id]).emit('COffer', e);
    });
    socket.on('SAnswer', function (e) {
        socket.to(p2p[socket.id]).emit('CAnswer', e);
    });
    socket.on('SIce', function (e) {
        socket.to(p2p[socket.id]).emit('CIce', e);
    });
    socket.on('SClose', function (e) {
        socket.to(p2p[socket.id]).emit('CClose', e);
    });
});


server.listen(3000);