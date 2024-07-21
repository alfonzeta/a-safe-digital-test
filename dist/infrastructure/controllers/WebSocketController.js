"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketController = void 0;
const ws_1 = require("ws");
class WebSocketController {
    constructor() {
        this.wss = new ws_1.WebSocketServer({ noServer: true });
        this.wss.on('connection', this.handleConnection.bind(this));
    }
    handleConnection(ws) {
        ws.on('message', this.handleMessage.bind(this));
        ws.send('Hello, WebSocket!');
    }
    handleMessage(message) {
        console.log('Received message:', message.toString());
    }
    setup(fastify) {
        fastify.server.on('upgrade', (request, socket, head) => {
            this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit('connection', ws, request);
            });
        });
    }
}
exports.WebSocketController = WebSocketController;
