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