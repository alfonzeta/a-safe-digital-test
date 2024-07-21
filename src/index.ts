import websocketPlugin from '@fastify/websocket';
import fastify from 'fastify';
import multipart from '@fastify/multipart';
import { container } from './config/di';
import { registerRoutes } from './config/routes';

const server = fastify();

server.register(websocketPlugin);
server.register(multipart);
registerRoutes(server);

server.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (socket, req) => { })
});

server.listen(8080, "0.0.0.0", async (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);

    try {
        await container.prisma.$connect();
        console.log('Connected to database');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
});
