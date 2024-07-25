import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import multipart, { fastifyMultipart } from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { container } from './config/di';
import registerRoutes from './config/routes';
import dotenv from 'dotenv';
dotenv.config();

const server = fastify({
    logger: true
});
export const wsClients: Set<any> = new Set(); // Set to keep track of WebSocket connections

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'A-sage digital test',
            description: 'API Documentation',
            version: '3.0.0',
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
});

server.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false
    },
    staticCSP: true,
    transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
    }
});

// Custom middleware to set CSP for Swagger UI
server.addHook('onSend', async (request, reply) => {
    // Check if the URL is defined and starts with `/documentation`
    const url = request.raw.url;
    if (url && url.startsWith('/documentation')) {
        reply.header('Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none';");
    }
});

server.register(websocketPlugin);
// WebSocket route
server.register(async function (fastify) {
    fastify.get('/*', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
        wsClients.add(socket); // Add new WebSocket connection to the set

        socket.on('message', message => {
            socket.send('hi from wildcard route');
        });

        socket.on('close', () => {
            wsClients.delete(socket); // Remove connection when it closes
        });
    });

    fastify.get('/', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
        wsClients.add(socket); // Add new WebSocket connection to the set

        socket.on('message', message => {
            socket.send('hi from server');
        });

        socket.on('close', () => {
            wsClients.delete(socket); // Remove connection when it closes
        });
    });
});
server.register(fastifyMultipart, {
    // attachFieldsToBody: true,
});

// Register your routes
// registerRoutes(server);
server.register(registerRoutes)

server.listen({ port: 8080, host: '0.0.0.0' }, async (err, address) => {
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
