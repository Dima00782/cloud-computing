const connection = new WebSocket('ws://localhost:8888');

const fireButton = document.querySelector('#fire-button');
const functionArea = document.querySelector('#function-area');
const dataArea = document.querySelector('#data-area');
const results = document.querySelector('#results');

const Greeting = "I'm client!";

let functionId = 0;

fireButton.addEventListener("click", () => {
	let functionText = functionArea.value;
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

connection.onmessage = (event) => {
	let data = null;
	try {
		data = JSON.parse(event.data);
	} catch (e) {
		console.log(e);
	}

	if (data != null && data.hasOwnProperty('result')) {
		let paragraph = document.createElement("p");
		let text = document.createTextNode(`id = ${data['id']} result = ${data['result']}`);
		paragraph.appendChild(text);
		results.appendChild(paragraph);
	}
};