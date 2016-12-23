// app/index.js

const WebSocket = require('ws');
const wss = new WebSocket(process.argv[2]);

wss.on('open', function() {
	// nothing to do here
});

function Map(col, func, blockSize = 5) {
	let nblocks = (Math.floor(col.length / blockSize) + (col.length % blockSize == 0 ? 0 : 1));
	for (let i = 0; i < nblocks; ++i) {
		let size = col.length - (i + 1) * blockSize > 0 ? blockSize : col.length - i * blockSize;
		console.log(size);

		let arguments = col.slice().splice(i * blockSize, size);
		arguments = arguments.join('\n');

		let functionText = "function map_iter(a)"
			+ "{ console.log(a); for (let i = " + i * blockSize + "; i < " + (i * blockSize + size) + "; ++i) {"
			+ "(" + func.toString() + ")(a); }}";

		let message = JSON.stringify({
			functionText : functionText,
			functionArgumentsText : arguments
		});
		wss.send(message);
	}
}

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

	let fn = eval("() => { return " + functionText + ";}")();
	let packagedFn = (...args) => fn(...functionArguments);

	console.log("Run:", functionText, "Arguments:", functionArguments);

	packagedFn();
});
