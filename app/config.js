var config = module.exports;
var PRODUCTION = process.env.NODE_ENV === "production";

config.express = {
    port: process.env.EXPRESS_PORT || 9191,
    ip: "127.0.0.1"
};

config.mongodb = {
    port: process.env.MONGODB_PORT || 27017,
    host: process.env.MONGODB_HOST || "localhost"
};

config.routes = {
    home: {
        reg: "^/*$",
        path: "routes/views/home.html",
        access: {
            roles: ["user"],
            fail: "redirect",
            redirect: "/login"
        }
    },
    room: {
        reg: "^/r/[^/]+/*$",
        path: "routes/views/home.html",
        access: {
            roles: ["user"],
            fail: "redirect",
            redirect: "/login"
        }
    },
    login: {
        reg: "/login",
        path: "routes/views/login.jade",
        access: {
            roles: ["visitator"],
            fail: "redirect",
            redirect: "/"
        }
    }
}

config.operations = {
    apiKey: "/@",
    apis: {
        login: {
            url: "/login",
            method: "post",
            path: "login/loginController.js",
            access: {
                roles: ["visitator"]
            }
        },
        logout: {
            url: "/logout",
            method: "post",
            path: "login/loginController.js",
            access: {
                roles: ["user"]
            }
        }
    }
}

config.events = {
    message: {
        path: "chat/events.js"
    },
    typing: {
        path: "chat/events.js"
    },
    stopped_typing: {
        path: "chat/events.js"
    },
    disconnect: {
        path: "chat/events.js"
    }
};

if (PRODUCTION) {
    config.express.ip = "0.0.0.0";
}