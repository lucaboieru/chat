var socket = io();
var typing = false;
var typingWait;

var visibility = "";

socket.on("new_client", function (clients) {
	$(".well").append("<p class='info'>A friend connected!</p>");
	$(".connectedClients").html(clients);
});

socket.on("client_left", function (clients) {
	$(".well").append("<p class='info'>A friend left!</p>");
	$(".connectedClients").html(clients);
});

socket.on("total_clients", function (clients) {
	$(".connectedClients").html(clients);
});

socket.on("new_message", function (message) {
	var messageHtml = "<div class='from-them'><p>" + message + "</p></div><div class='clearfix'></div>";
	$(".well").append(messageHtml);
	$('.well').animate({scrollTop: $('.well').prop("scrollHeight")}, 50);
	if (visibility === "hidden") {
        var audio = new Audio("/res/notification_sound.mp3");
        audio.play();
    }
});

socket.on("is_typing", function () {
	$(".well").append($(".isTyping").show());
});

socket.on("has_stopped_typing", function () {
	$(".isTyping").hide();
});

$(document).ready(function () {
	$(document).keypress(function (e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			sendMessage();
		} else {
			isTyping();
		}
	});
});

// listen for window blur/focus events
(function() {
    var hidden = "hidden";

    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ("onfocusin" in document)
        document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

    function onchange (evt) {
        var v = "visible", h = "hidden",
            evtMap = {
                focus: v, focusin:v, pageshow: v, blur: h, focusout: h, pagehide: h
            };

        evt = evt || window.event;

        if (evt.type in evtMap){
            visibility = evtMap[evt.type];
        } else {
            visibility = this[hidden] ? "hidden" : "visible";
        }
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if(document[hidden] !== undefined)
        onchange({type: document[hidden] ? "blur" : "focus"});
})();

function isTyping () {
	if (typing === false) {
		typing = true;
		socket.emit("typing");
	}
	clearTimeout(typingWait);
	typingWait = setTimeout(function () {
		typing = false;
		socket.emit("stopped_typing");
	}, 3000);
}

function sendMessage () {
	var message = $(".messageTextarea").val();

	if (!message) return;

	$(".messageTextarea").val("");
	socket.emit("stopped_typing");
	socket.emit("message", message);
	
	var messageHtml = "<div class='from-me'><p>" + message + "</p></div><div class='clearfix'></div>";
	$(".well").append(messageHtml);
	$('.well').animate({scrollTop: $('.well').prop("scrollHeight")}, 500);
}