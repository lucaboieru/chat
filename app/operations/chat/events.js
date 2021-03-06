exports.message = function (args, socket, s) {
	// get room
	var host = socket.request.headers.host;
	var path = socket.request.headers.referer;
	path = path.slice(path.indexOf(host) + host.length);
	var sockets = s.sockets[path];
	
	sockets.emit("new_message", socket.id, {
		emitter: sockets.players[socket.id].username,
		msg: args
	});
};

exports.typing = function (args, socket, s) {
	// get room
	var host = socket.request.headers.host;
	var path = socket.request.headers.referer;
	path = path.slice(path.indexOf(host) + host.length);

	var sockets = s.sockets[path];

	sockets.emit("is_typing", socket.id);
};

exports.stopped_typing = function (args, socket, s) {
	// get room
	var host = socket.request.headers.host;
	var path = socket.request.headers.referer;
	path = path.slice(path.indexOf(host) + host.length);

	var sockets = s.sockets[path];

	sockets.emit("has_stopped_typing", socket.id);
};

exports.disconnect = function (args, socket, s) {

	// get room path
	var host = socket.request.headers.host;
	var path = socket.request.headers.referer;
	path = path.slice(path.indexOf(host) + host.length);

	// check if room exists
	if (s.sockets[path]) {

		if (s.sockets[path].players && s.sockets[path].players[socket.id]) {

			s.sockets[path].emit("client_left", socket.id, s.sockets[path].players[socket.id].username);

			delete s.sockets[path].players[socket.id];

			var arr = [];
			Object.keys(s.sockets[path].players).forEach(function (item) {
				arr.push(s.sockets[path].players[item].username);
			});
			s.sockets[path].emit("total_clients", null, { length: Object.keys(s.sockets[path].players).length, arr: arr});

			// delete room if no more players
			if (!Object.keys(s.sockets[path].players).length) {
				delete s.sockets[path];

				// check if room is in matching queue
				var index = s.matchQueue.indexOf(path);
				if (index !== -1) {
					s.matchQueue.splice(index, 1);
				}
			}
		}
	}
};