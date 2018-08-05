function vlcPlayer() {
	// Set the root node
	var _this = this;
	// Vars
	this.address = null;
	this.isSecure = false;
	// Optional endpoint descriptors
	this.name = null;
	this.location = null;
	this.description = null;
	// Websocket
	this.socket = null;
	this.currentState = {};
	// Create connection
	this.openSocket = function() {
		// Check that there is an address
		if(!!this.address) {
			// Set the full location
			var location = (this.isSecure === true ? "wss://" : "ws://") + this.address;
			// Create the connection
			this.socket = new WebSocket(location);
			// Attach the connected event handler
			this.socket.onopen = function() {
				// Get what is currently playing
				_this.getPlaying();
			};
			// Attach the error event handler
			this.socket.onerror = function(error) {
				console.log("[VLC] Error: " . error);
			};
			// Attach the message received handler
			this.socket.onmessage = function(e) {
				// Set the state of the player into the array
				var data = JSON.parse(e.data);
				// console.log(data);
				_this.currentState = data;
			};
		}
	}
	// Getters
	this.getPlaying = function() {
		// Set the message
		var message = {
			type: "playing"
		}
		// Send the command
		_this.putMessage(message);
	}
	// Setters
	this.putMessage = function(message) {
		// Encode the message
		var message = JSON.stringify(message);
		// Check that the socket is open
		if(!!this.socket && this.socket.readyState === 1) {
			// Send the message
			this.socket.send(message);
		}
	}
	this.putAddress = function(address) {
		// Set the variable
		this.address = (!!address ? address : null);
	}
	this.putIsSecure = function(isSecure) {
		// Set the variable
		this.isSecure = ((isSecure === true || isSecure.toLowerCase() === "true") ? true : false);
	}
	this.putName = function(name) {
		// Set the variable
		this.name = (!!name ? name : null);
	}
	this.putLocation = function(location) {
		// Set the variable
		this.location = (!!location ? location : null);
	}
	this.putDescription = function(description) {
		// Set the variable
		this.description = (!!description ? description : null);
	}
	// Controls
	this.pause = function() {
		// Set the message
		var message = {
			type: "pause"
		}
		// Send the command
		this.putMessage(message);
	}
	this.play = function() {
		// Set the message
		var message = {
			type: "play"
		}
		// Send the command
		this.putMessage(message);
	}
	this.playAddress = function(streamAddress) {
		// Check that a URL was given
		if(!!streamAddress) {
			// Check if the URL API is available
			if("URL" in window) {
				// Get the address
				var parseElement = new URL(streamAddress);
				// Get the protocol
				var protocol = parseElement.protocol;
			} else {
				// Create the elements
				var parseElement = document.createElement('a');
				// Assign the URL
				parseElement.href = streamAddress;
				// Get the protocol back
				var protocol = parseElement.protocol;
			}
			// Get the protocol is acceptable
			if(protocol.toLowerCase() === "http:" || protocol.toLowerCase() === "https:" || protocol.toLowerCase() === "udp:") {
				// Set the message
				var message = {
					type: "openURL",
					url: streamAddress
				}
				// Send the command
				this.putMessage(message);
			} else {
				console.log("[VLC " + _this.address + "] The stream address is not a supported protocol (http, https, UDP).");
				return false;
			}
		}
	}
}