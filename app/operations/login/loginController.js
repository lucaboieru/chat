var fs = require("fs");
var path = require("path");
var model = require("./loginModel");

exports.login = function (source) {

    // check if user is already logged in
    if (source.req.session.login) {
        return source.res.status(400).send("Already logged in");
    }

    // get username and password
    var username = source.data.username.toString();
    var password = source.data.password.toString();

    // find user
    model.findUser({
        username: username,
        password: password
    }, function (err, user) {

        // handle error
        if (err) {
            return source.res.status(500).send(err.toString());
        }

        // user not found
        if (!user) {
            return source.res.status(400).send("Invalid login credentials");
        }

        // get the user role (if it exists)
        var role = (user.role) ? user.role : null;

        // set session
        source.req.session.login = {
            user: user.username,
            role: role
        };

        // end request
        source.res.writeHead(302, {"location": "http://" + source.req.headers.host + "/"});
        source.res.end();
    });
};

exports.logout = function (source) {
    // check if user is already logged out
    if (!source.req.session.login.role) {
        return source.res.status(400).send("Already logged out");
    }
    delete source.req.session.login;
    source.res.writeHead(302, {"location": "http://" + source.req.headers.host + "/"});
    source.res.end();
};

exports.register = function (source) {
    // get username and password
    var username = source.data.username.toString();
    var password = source.data.password.toString();
    var confirmPassword = source.data.confirmPassword.toString();
    //var img = source.data.

    if (!username || !password || !source.req.files.image) {
        return source.res.status(400).send("Please fill in all the fields.");
    }

    if (password !== confirmPassword) {
        return source.res.status(400).send("Passwords don't match.");
    }

    if (source.req.files.image.extension !== 'jpg') {
        return source.res.status(400).send("Image format not ok. JPG only!");
    }

    model.findUser({
        username: username
    }, function (err, user) {

        // handle error
        if (err) {
            return source.res.status(500).send(err.toString());
        }

        if (user) {
            return source.res.status(400).send("Username already exists.");
        }

        model.insertUser({
            username: username,
            password: password,
            role: "user"
        }, function (err, user) {

            // handle error
            if (err) {
                return source.res.status(500).send(err.toString());
            }

            fs.readFile(source.req.files.image.path, function (err, data) {
                var newPath = path.join(__dirname, "../../../", "public/imgs/" + username + ".jpg");
                fs.writeFile(newPath, data, function (err) {

                    if (err) {
                        return source.res.status(500).send(err.toString());
                    }

                    // set session
                    source.req.session.login = {
                        user: username,
                        role: "user"
                    };

                    // end request
                    source.res.writeHead(302, {"location": "http://" + source.req.headers.host + "/"});
                    source.res.end();     
                });
            });
        });
    });
};