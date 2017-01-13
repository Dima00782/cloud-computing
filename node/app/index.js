// app/index.js

const WebSocket = require('ws');
const wss = new WebSocket(process.argv[2]);
const iterators = {};
const Greeting = "I'm new node!";

let nodeId = -1;
let currentFunctionId = undefined;

wss.on('open', function() {
	wss.send(Greeting);
});

function* CLOUD_MAP(col, func, blockSize = 5) {
	let nblocks = (Math.floor(col.length / blockSize) + (col.length % blockSize == 0 ? 0 : 1));
	for (let i = 0; i < nblocks; ++i) {
		let size = col.length - (i + 1) * blockSize > 0 ? blockSize : col.length - i * blockSize;

		let arguments = col.slice().splice(i * blockSize, size);

		let functionText = `function map_iter(a) {
			let result = [];
			for (let i = 0; i < a.length; ++i) {
				result.push((${func.toString()})(a[i]));
			}
			return result;
		}`;

		let message = JSON.stringify({
			functionText : functionText,
			functionArgumentsText : "[ " + arguments.toString() + " ]",
			nodeId : nodeId,
			id : currentFunctionId,
			blockIdx : i * blockSize
		});
		wss.send(message);
	}
	return yield nblocks;
}

function isNumeric(sym) {
    return sym == "0" 
    || sym == "1"
    || sym == "2"
    || sym == "3"
    || sym == "4"
    || sym == "5"
    || sym == "6"
    || sym == "7"
    || sym == "8"
    || sym == "9";
}

function parseArguments(functionArguments) {
	functionArguments = functionArguments.split('\n');
	functionArguments = functionArguments.map((x) => {
		x = x.trim();
		if (x[0] == "{") {
			return JSON.parse(x);
		} else if (x[0] == "[") {
			return str = x.slice(1, x.length - 1)
			.split(',')
			.map((x) => { return parseInt(x, 10); });
		} else if (isNumeric(x[0])) {
			return parseInt(x);
		}
		return x;
	});
	return functionArguments;
}

function parseFunction(functionText) {
	// make generator from function
	functionText = functionText.substr(0, 8) + "*" + functionText.substr(8);

	// replace add "yield*" to Map calls
	functionText = functionText.replace(/CLOUD_MAP/g, "yield* CLOUD_MAP");

	return eval("() => { return " + functionText + ";}")();
}

function handleGreeting(obj) {
	nodeId = obj['node_id'];
	console.log("My ID", nodeId);
}

function handleState(state, obj, iter) {
	if (state.done == true) {
		let value = state.value == undefined ? null : state.value;
		let msg = JSON.stringify({
			result : value,
			id : obj['id'],
			nodeId : obj['nodeId'],
			blockIdx : obj['blockIdx']
		});

		console.log("MESSAGE", msg);

		wss.send(msg);
	} else {
		iterators[currentFunctionId] = {
			iter : iter,
			values : [],
			obj : obj,

			// the number of remained block to continue function
			nblocks : state.value
		};
	}
}

function handleResult(obj) {
	currentFunctionId = obj['id'];
	let functionState = iterators[obj['id']];
	functionState.values.push({
		values : obj['result'],
		id : obj['blockIdx']
	});
	--functionState.nblocks;

	if (functionState.nblocks == 0) {
		let values = new Array(functionState.nblocks);
		functionState.values.forEach((block) => {
			let j = block.id;
			for (let k = 0; k < block.values.length; ++k) {
				values[j++] = block.values[k];
			}
		});
		functionState.values = values;
		iterators[currentFunctionId] = undefined;
		handleState(functionState.iter.next(values), functionState.obj, functionState.iter);

	} else {
		iterators[currentFunctionId] = functionState;
	}
}

function handleFunction(obj) {
	let fn = parseFunction(obj['functionText']);
	let functionArguments = parseArguments(obj['functionArgumentsText']);
	currentFunctionId = obj['id'];
	let packagedFn = (...args) => fn(...functionArguments);

	console.log("Run:\n", fn.toString(), "\n\nArguments:", functionArguments);

	let iter = packagedFn();
	handleState(iter.next(), obj, iter);
}

wss.on('message', function(data, flags) {
	let obj = null;
	try {
		obj = JSON.parse(data);
	} catch (e) {
		console.log(e);
	}

	if (obj != null) {
		if (obj.hasOwnProperty('node_id')) {
			handleGreeting(obj);
		} else if (obj.hasOwnProperty('result')) {
			handleResult(obj);
		} else {
			handleFunction(obj);
		}
	}
});
