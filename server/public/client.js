const connection = new WebSocket('ws://localhost:8888');

const fireButton = document.querySelector('#fire-button');
const functionArea = document.querySelector('#function-area');
const dataArea = document.querySelector('#data-area');

const Greeting = "I'm client!";

fireButton.addEventListener("click", () => {
	let functionText = functionArea.value;
	let functionArguments = dataArea.value

	let message = JSON.stringify({
		functionText : functionText,
		functionArgumentsText : functionArguments	
	});
	connection.send(message);
});
  
connection.onopen = () => {
	console.log("Connected");
	connection.send(Greeting);
};