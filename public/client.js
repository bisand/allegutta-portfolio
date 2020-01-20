// wss: protocol is equivalent of https:
// ws:  protocol is equivalent of http:
// You ALWAYS need to provide absolute address
// I mean, you can't just use relative path like /echo
const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const echoSocketUrl =
  socketProtocol + "//" + window.location.hostname + ':' + window.location.port + "/echo/";
const socket = new WebSocket(echoSocketUrl);

socket.onopen = () => {
  socket.send("Here's some text that the server is urgently awaiting!");
};

socket.onmessage = e => {
  console.log("Message from server:", event.data);
};
