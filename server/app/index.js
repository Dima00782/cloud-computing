// app/index.js

const HTTP = require('http');
const PORT = 8888;
const FS = require('fs');
const PATH = require('path');
const URL = require('url');

const ClientGreeting = "I'm client!";
const NodeGreeting = "I'm new node!";

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

let nodes = [];
let nodeIdx = 0;
let client = null;

wss.on('connection', function (connection) {
	connection.on('message', function (message) {
		if (ClientGreeting == message) {
			client = connection;
		}
		else if (NodeGreeting == message) {
			let currentNodeIdx = nodes.length;
			nodes.push(connection);

			connection.send(JSON.stringify({ node_id : currentNodeIdx }));
		} else {
			let data = JSON.parse(message);
			if (data.hasOwnProperty('result')) {
				if (data.hasOwnProperty('nodeId')) {
					client.send(JSON.stringify({
						id : data['id'],
						progress : true
					}));
					nodes[parseInt(data['nodeId'])].send(message);
				} else {
					client.send(message);
				}
			} else {
				if (nodes.length == 0) {
					client.send(JSON.stringify({
						id : data['id'],
						result : "not enough nodes"
					}));
				} else {
					nodes[nodeIdx].send(message);
					nodeIdx = (nodeIdx + 1) % nodes.length;
				}
			}
		}
		console.log("ON MESSAGE: ", message);
	});

	connection.on('close', function () {
		if (client != connection) {
			let idx = nodes.indexOf(connection);
			nodes.splice(nodes.indexOf(connection), 1);
			console.log("Goodbye node", idx);
		}
	});
});
