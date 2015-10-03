var config = require("../config");
var join = require('path').join;
var log = require('bole')('operations/sockets');

var event_cache = {};
var s;

function handleEvent (event, args, config, socket) {

    // TODO check permissions

    // cache event if it isn't already
    if (!event_cache[event]) {
        try {
            event_cache[event] = require(join(__dirname + '/' + config.path))[event];
        } catch (error) {
            return console.error(error, 'Error while caching event: ' + event);
        }
    }

    // call event handler
    event_cache[event](args, socket, s);
}

function emitToRoom (event, emitterId, args) {
    // emit to all players
    for (var player in this.players) {
        if (player === emitterId) continue;
        s.io.to(player).emit(event, args);
    }
}

module.exports = function (core) {
    var io = core.s.io;
    s = core.s;

    // listen for connections
    io.on('connection', function (socket) {
        var host = socket.request.headers.host;
        var path = socket.request.headers.referer;

        // build sockets object
        path = path.slice(path.indexOf(host) + host.length);
        for (var route in config.routes) {
            var reg = new RegExp(config.routes[route].reg);
            if (path.match(reg)) {
                if (!s.sockets[path]) {
                    s.sockets[path] = {
                        status: "opened",
                        path: path
                    };
                }

                s.sockets[path].players = s.sockets[path].players || {};

                // room status must be 'opened'
                if (s.sockets[path].status === "opened") {

                    // add client
                    s.sockets[path].players[socket.id] = {
                        id: socket.id,
                        emit: function (event, args) {
                            s.io.to(socket.id).emit(event, args);
                        }
                    };

                    // add emit function
                    s.sockets[path].emit = emitToRoom;

                    // emit new client
                    socket.emit("total_clients", Object.keys(s.sockets[path].players).length);
                    s.sockets[path].emit("new_client", socket.id, Object.keys(s.sockets[path].players).length);
                }
            }
        }

        // listen for events
        for (var event in config.events) {
            (function (event) {
                socket.on(event, function (args) {
                    handleEvent(event, args, config.events[event], socket);
                });
            })(event);
        }
    });
};