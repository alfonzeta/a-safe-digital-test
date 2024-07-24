import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import multipart, { fastifyMultipart } from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { container } from './config/di';
import registerRoutes from './config/routes';
import dotenv from 'dotenv';
dotenv.config();

const server = fastify();

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
        console.log('Swagger Object:', swaggerObject); // Debugging line
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
server.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (socket, req) => { });
});

server.register(multipart, {
    // attachFieldsToBody: true,
    limits: {
        fileSize: 100 * 1024, // 100 KB
    },
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
