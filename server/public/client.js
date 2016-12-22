let connection = new WebSocket('ws://localhost:8888');

let fireButton = document.querySelector('#fire-button');
let functionArea = document.querySelector('#function-area');
let dataArea = document.querySelector('#data-area');

fireButton.addEventListener("click", () => {
	let functionText = functionArea.value;
	let functionArguments = dataArea.value

	let message = JSON.stringify({
		functionText : functionText,
		functionArgumentsText : functionArguments	
	});
	connection.send(message);
});
  
connection.onopen = () => { console.log("Connected"); };