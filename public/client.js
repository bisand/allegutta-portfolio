// wss: protocol is equivalent of https:
// ws:  protocol is equivalent of http:
// You ALWAYS need to provide absolute address
// I mean, you can't just use relative path like /echo
const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const echoSocketUrl = socketProtocol + '//' + window.location.hostname + ':' + window.location.port + '/echo/';
const socket = new WebSocket(echoSocketUrl);

socket.onopen = () => {
    socket.send(JSON.stringify({ command: 'start' }));
};

socket.onmessage = e => {
    if ((e.data && e.data[0] === '{') || e.data[0] === '[') {
        var portfolio = JSON.parse(e.data);
        if (portfolio && portfolio.positions) {
            CreateTableFromJSON(portfolio.positions);
        }
    }
    console.log(portfolio);
};

function CreateTableFromJSON(jsonData) {
    var col = [];
    for (var i = 0; i < jsonData.length; i++) {
        for (var key in jsonData[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    // CREATE DYNAMIC TABLE.
    var table = document.createElement('table');

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1); // TABLE ROW.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement('th'); // TABLE HEADER.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < jsonData.length; i++) {
        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = jsonData[i][col[j]];
        }
    }

    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    var divContainer = document.getElementById('showData');
    divContainer.innerHTML = '';
    divContainer.appendChild(table);
}
