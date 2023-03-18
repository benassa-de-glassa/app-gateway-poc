import { WebSocketServer } from 'ws';

// const wss = new WebSocketServer({ port: 8080, host: "127.0.0.1" });

// wss.on("connection", (ws) => {
//   console.log("New client connected!");
//   ws.send("[connection established]");
//   ws.on("close", () => console.log("Client has disconnected!"));
//   ws.on("message", (data) => {
//     console.warn(wss.clients.size);
//     console.warn(data.toString());
//     wss.clients.forEach((client) => {
//       console.warn(client);
//       const response = {
//         type: "queriedDocuments",
//         query: "ROOT(undefined)",
//         queryResponse: {
//           nextCursor: null,
//           resources: [
//             {
//               date: new Date(),
//               id: (Math.random() + 1).toString(36).substring(7),
//               text: (Math.random() + 1).toString(36).substring(7),
//             },
//           ],
//         },
//       };
//       console.log(`distributing message: ${JSON.stringify(response)}`);
//       client.send(JSON.stringify(response));
//     });
//   });
//   ws.onerror = function () {
//     console.log("websocket error");
//   };
// });

import { createServer } from 'http';
import { parse } from 'url';

const server = createServer();
const wss1 = new WebSocketServer({ noServer: true });
const wss2 = new WebSocketServer({ noServer: true });

wss1.on('connection', function connection(ws) {
  ws.on('error', console.error);
  ws.on('message', data => {
    console.warn(data.toString());
    ws.send(data.toString());
  });
  // ...
});

wss2.on('connection', function connection(ws) {
  ws.on('error', console.error);

  // ...
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url ?? '');

  if (pathname === '/foo') {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
  } else if (pathname === '/bar') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(8080);
