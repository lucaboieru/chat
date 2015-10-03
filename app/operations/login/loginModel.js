var mongo = require("../../lib/mongo");

exports.findUser = function (user, callback) {

	// fetch db object
	mongo.connect("chat", function (err, db) {

		// handle error
		if (err) {
			return callback(err);
		}

		// fetch collection
		db.collection("users", function (err, col) {

			// handle error
			if (err) {
				return callback(err);
			}

			// find user
			col.findOne(user, callback);
		});
	});
}