
import fastify from 'fastify';
import { container } from './config/di';
import { registerRoutes } from './config/routes';

const server = fastify();
registerRoutes(server);

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
