const connection = new WebSocket('ws://localhost:8888');

const fireButton = document.querySelector('#fire-button');
const functionArea = document.querySelector('#function-area');
const dataArea = document.querySelector('#data-area');
const resultsContainer = document.querySelector('#results');
const results = {};
const SIZE_OF_ONE_BLOCK = 20;

const myCodeMirror = CodeMirror.fromTextArea(functionArea, {
	value : "",
	mode : "javascript",
	autofocus : true,
	lineNumbers: true
});

const Greeting = "I'm client!";

let functionId = 0;

fireButton.addEventListener("click", () => {
	myCodeMirror.save();
	let functionText = functionArea.value.trim();
	let functionArguments = dataArea.value

	let message = JSON.stringify({
		functionText : functionText,
		functionArgumentsText : functionArguments,
		id : functionId
	});
	connection.send(message);
	++functionId;
});
  
connection.onopen = () => {
	console.log("Connected");
	connection.send(Greeting);
};

function getResultRecord(id) {
	if (!results[id]) {
		let paragraph = document.createElement("p");
		paragraph.className = "results-paragraph";
		let progress = document.createElement("progress")
		paragraph.appendChild(progress);
		results[id] = {
			paragraph : paragraph,
			progress : progress
		};
	}
	return results[id];
}

connection.onmessage = (event) => {
	let data = null;
	try {
		data = JSON.parse(event.data);
	} catch (e) {
		console.log(e);
	}

	if (data != null) {
		if (data.hasOwnProperty('result')) {
			let result = getResultRecord(data['id']);
			let text = document.createTextNode(`id = ${data['id']} result = ${data['result']}`);
			result.progress.value = result.progress.max;
			result.paragraph.appendChild(text);
		} else {
			console.log(data);
			let result = getResultRecord(data['id']);
			if (result.progress.position + SIZE_OF_ONE_BLOCK >= result.progress.max) {
				result.progress.max += 2 * SIZE_OF_ONE_BLOCK;
			}
			result.progress.value = result.progress.position + SIZE_OF_ONE_BLOCK;
			resultsContainer.appendChild(result.paragraph);
		}
	}
};