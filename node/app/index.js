// app/index.js

const WebSocket = require('ws');
const wss = new WebSocket(process.argv[2]);

wss.on('open', function() {
	// nothing to do here
});

wss.on('message', function(data, flags) {
	let obj = null;
	try {
		obj = JSON.parse(data);
	} catch (e) {
		console.log(e);
	}

	let functionText = obj['functionText'];
	let functionArguments = obj['functionArgumentsText'].split('\n');

	functionArguments = functionArguments.map((x) => {return parseInt(x, 10);});
	let fn = Function("return " + functionText)();
	let packagedFn = (...args) => fn(...functionArguments);

	packagedFn();
});
