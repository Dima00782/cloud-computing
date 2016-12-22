// app/index.js

const HTTP = require('http');
const PORT = 8888;
const FS = require('fs');
const PATH = require('path');
const URL = require('url');

function handleRequest(request, response) {
	console.log(request.url);
	let urlPath = URL.parse(request.url).pathname;
	let filePath = PATH.join(__dirname, '..', 'public', urlPath);
	if (urlPath === '' || urlPath === '/') {
		filePath = PATH.join(__dirname, '..', 'public', 'index.html');		
	}
	FS.stat(filePath, (err, stats) => {
		if (err || !stats.isFile()) {
			response.statusCode = 404;
			response.end('Not found');
			return;
		}
		FS.createReadStream(filePath).pipe(response);
	});
}

const server = HTTP.createServer(handleRequest);

server.listen(PORT, () => { console.log("Server listening on: http://localhost:%s", PORT); });

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server });

wss.on('connection', function (connection) {
	connection.on('message', function (message) {
		let fn = null;
		try {
			data = JSON.parse(message);
			fn();
		} catch (e) {
			console.log("Error parsing JSON");
		}
		console.log("ON MESSAGE:", message);
	});

	connection.on('close', function () {
		console.log("ON CLOSE");
	});
});
