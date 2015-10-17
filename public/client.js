var ControlComponent = React.createClass({
	logout: function () {
		makeAjaxRequest({
			operation: "/@/logout",
			data: {}
		}, function (err, data) {
			if (err)
				return alert(err);
			window.location = "/";
		});
	},
	render: function () {

		var self = this;

		return (
			<div className="row controlWrapper">
				<div className="logout" onClick={self.logout}>
					<i className="fa fa-power-off"></i>
				</div>
			</div>
		);
	}
});

var OnlineListComponent = React.createClass({
	render: function () {

		var self = this;

		var clients = self.props.clients;
		var totalClients = clients.length;

		var clientJSX = clients.map(function (item, index) {
			return (
				<div className="userList" key={index}>
					<div className="userItem">
						<div className="listImg" style={{backgroundImage: "url(/imgs/" + item + ".jpg)"}}></div>
						<span className="listUsername">{item}</span>
						<div className="clearfix"></div>
					</div>
				</div>
			);
		});

		return (
			<div>
				<div className="row">
					<div className="connectionStatus">
						Online ({totalClients})
					</div>
				</div>
				<div className="row userListWrapper">
					{clientJSX}
				</div>
				<ControlComponent />
			</div>
		);
	}
});

var MessageComponent = React.createClass({
	getInitialState: function () {
		return {
			messages: [
				{
					type: "info",
					message: "Welcome!"
				}
			]
		};
	},
	componentWillReceiveProps: function (nextProps) {
		var self = this;

		// check if object is empty
		if (Object.keys(nextProps.message).length === 0) return;

		var messages = self.state.messages;
		messages.push(nextProps.message);
		self.setState(messages);
	},
	componentWillUpdate: function() {
		var node = ReactDOM.findDOMNode(this);
		this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
	},
	componentDidUpdate: function() {
		if (this.shouldScrollBottom) {
			var node = ReactDOM.findDOMNode(this);
			node.scrollTop = node.scrollHeight
		}
	},
	render: function () {

		var self = this;

		var messageJSX = self.state.messages.map(function (item, index) {
			if (item.type === "info") {
				return (
					<p key={index} className='info'>
						{item.message}
					</p>
				);
			} else if (item.type === "message") {
				return (
					<div key={index} className="messageWrapper">
						<div className="emitter" style={{backgroundImage: "url(/imgs/" + item.emitter + ".jpg)"}}></div>
						<div className="username">{item.emitter}</div>
						<div className="from-them">
							<p>{item.message}</p>
						</div>
						<div className="clearfix"></div>
					</div>
				);
			} else if (item.type === "myMessage") {
				return (
					<div key={index}>
						<div className="from-me">
							<p>{item.message}</p>
						</div>
						<div className="clearfix"></div>
					</div>
				);
			}
		});
		return (
			<div>
				{messageJSX}
			</div>
		);
	}
});

var ChatComponent = React.createClass({
	getInitialState: function () {
		return {
			clients: [],
			newMessage: {},
			isTyping: false,
			typingWait: null
		};
	},
	componentDidMount: function () {
		var self = this;
		self.socket = io();

		self.socket.on("new_client", function (client) {
			self.setState({
				newMessage: {
					type: "info",
					message: (client + " connected.")
				}
			});
		});

		self.socket.on("client_left", function (client) {
		    self.setState({
				newMessage: {
					type: "info",
					message: (client + " left.")
				}
			});
		});

		self.socket.on("total_clients", function (clients) {
			self.setState({
				clients: clients,
				newMessage: {}
			});
		});

		self.socket.on("new_message", function (data) {
			self.setState({
				newMessage: {
					type: "message",
					emitter: data.emitter,
					message: data.msg
				}
			});
		});

		self.socket.on("is_typing", function () {
			self.setState({
				isTyping: true,
				newMessage: {}
			})
		});

		self.socket.on("has_stopped_typing", function () {
			self.setState({
				isTyping: false,
				newMessage: {}
			})
		});
	},
	sendMessage: function (textarea) {
		var message = textarea.value;
		if (!message) return;

		var self = this;

		textarea.value = "";

		self.socket.emit("stopped_typing");
		self.socket.emit("message", message);
		self.setState({
			newMessage: {
				type: "myMessage",
				message: message
			}
		});
	},
	isTyping: function (e) {

		var self = this;

		if (e.keyCode === 13) {
			e.preventDefault();
			self.sendMessage(e.target);
		} else {
			if (self.state.isTyping === false) {
				self.socket.emit("typing");
			}
			clearTimeout(self.state.typingWait);
			self.setState({
				typingWait: (function (self) {
					return setTimeout(function () {
						self.socket.emit("stopped_typing");
					}, 3000);
				})(self),
				newMessage: {}
			});
		}
	},
	render: function () {

		var self = this;

		return (
			<div>
				<div className="col-sm-4 onlineList">
					<OnlineListComponent clients={self.state.clients} />
				</div>
				<div className="well messageContainer col-sm-8">
					<MessageComponent message={self.state.newMessage} />
				</div>
				{ self.state.isTyping ? <i className="info isTyping">Someone is typing...</i> : null }
				<textarea className="col-xs-12 col-sm-8 messageTextarea" placeholder="Type to chat..." onKeyDown={self.isTyping}></textarea>
			</div>
		);
	}
});

var MainComponent = React.createClass({
	render: function () {
		return (
			<div className="col-sm-offset-2 col-sm-8">
				<div className="row">
					<img src="/res/logo.png" className="logo" />
				</div>
				<div className="row">
					<ChatComponent />
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<MainComponent />,
	document.getElementById("mainContainer")
);

function makeAjaxRequest (ajaxObj, callback) {
    $.ajax({
        url: ajaxObj.operation,
        type: ajaxObj.method || "POST",
        data: ajaxObj.data || {},
        error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                callback('Not connect. Verify Network.' + jqXHR.responseText);
            } else if (jqXHR.status == 404) {
                callback('Requested page not found. [404].' + jqXHR.responseText);
            } else if (jqXHR.status == 500) {
                callback('Internal Server Error [500].' + jqXHR.responseText);
            } else if (exception === 'parsererror') {
                callback('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                callback('Time out error.');
            } else if (exception === 'abort') {
                callback('Ajax request aborted.');
            } else {
                callback('Uncaught Error.\n' + jqXHR.responseText);
            }
        },
        success: function (data) {
            callback(null, data);
        }
    });
}