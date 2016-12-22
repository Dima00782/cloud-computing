let connection = new WebSocket('ws://localhost:8888');

let fireButton = document.querySelector('#fire-button');
let functionArea = document.querySelector('#function-area');
let dataArea = document.querySelector('#data-area');

fireButton.addEventListener("click", () => {
	let functionText = functionArea.value;
	let functionArguments = dataArea.value.split('\n');

	functionArguments = functionArguments.map((x) => {return parseInt(x, 10);});

	let fn = Function("return " + functionText)();
	let packagedFn = (...args) => fn(...functionArguments);
	let res = packagedFn();
	console.log(res);

	connection.send(JSON.stringify(packagedFn));
});

// function startPeerConnection(user) {
//   connectedUser = user;

//   // Begin the offer
//   yourConnection.createOffer(function (offer) {
//     send({
//       type : "offer",
//       offer : offer
//     });

//     yourConnection.setLocalDescription(offer);
//   }, function (error) {
//     alert("An error has occurred.");
//   });
// }

// function onOffer(offer, name) {
//   connectedUser = name;
//   yourConnection.setRemoteDescription(new RTCSessionDescription(offer));

//   yourConnection.createAnswer(function (answer) {
//     yourConnection.setLocalDescription(answer);
//     send({
//       type : "answer",
//       answer : answer
//     });
//   }, function (error) {
//     alert("An error has occurred");
//   });
// }

// function onAnswer(answer) {
//   yourConnection.setRemoteDescription(new RTCSessionDescription(answer));
// }

// function onCandidate(candidate) {
//   yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
// }

// function onLogin(success) {
//   if (success === false) {
//     alert("Login unsuccessful, please try a different name.");
//   } else {
//     loginPage.style.display = "none";
//     callPage.style.display = "block";

//     // Get the plumbing ready for a call
//     startConnection();
//   }
// }
  
connection.onopen = () => { console.log("Connected"); };

// // Handle all messages through this callback
// connection.onmessage = function (message) {
//   console.log("Got message", message.data);

//   var data = JSON.parse(message.data);
//   switch(data.type) {
//     case "login":
//       onLogin(data.success);
//       break;
//     case "offer":
//       onOffer(data.offer, data.name);
//       break;
//     case "answer":
//       onAnswer(data.answer);
//       break;
//     case "candidate":
//       onCandidate(data.candidate);
//       break;
//     case "leave":
//       console.log("TODO : onLeave not implemented");
//       break;
//     default:
//       break;
//   }
// };

// connection.onerror = function (err) {
//   console.log("Got error", err);
// };

// // Alias for sending messages in JSON format
// function send(message) {
//   if (connectedUser) {
//     message.name = connectedUser;
//   }

//   connection.send(JSON.stringify(message));
// }

// function startConnection() {
//   navigator.mediaDevices.getUserMedia({video : true, audio : false})
//     .then((myStream) => {
//       stream = myStream;
//       yourVideo.srcObject = stream;

//       setupPeerConnection(stream);
//     }).catch((error) => {
//       console.log(error);
//     });
// }

// function setupPeerConnection(stream) {
//   var configuration = {
//     "iceservers" : [{ "url" : "stun:stun.1.google.com:19302" }]
//   };

//   yourConnection = new RTCPeerConnection(configuration);

//   // Setup stream listening
//   yourConnection.addStream(stream);
//   yourConnection.ontrack = function (e) {
//     theirVideo.src = window.URL.createObjectURL(e.streams[0]);
//   };

//   // Setup ice handling
//   yourConnection.onicecandidate = function (event) {
//     if (event.candidate) {
//       send({
//         type : "candidate",
//         candidate : event.candidate
//       });
//     }
//   };
// }