import { FastifyInstance } from 'fastify';
import { WebSocket, WebSocketServer } from 'ws';

export class WebSocketController {
  private wss: WebSocketServer;

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  handleConnection(ws: WebSocket) {
    ws.on('message', this.handleMessage.bind(this));
    ws.send('Hello, WebSocket!');
  }

  handleMessage(message: string) {
    console.log('Received message:', message.toString());
  }

  setup(fastify: FastifyInstance) {
    fastify.server.on('upgrade', (request, socket, head) => {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });
  }
}
