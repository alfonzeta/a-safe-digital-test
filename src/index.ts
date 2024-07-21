import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import multipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { container } from './config/di';
import registerRoutes from './config/routes';
import dotenv from 'dotenv';


dotenv.config();

console.log(process.env.SECRET_KEY);




const server = fastify();

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Your API',
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

server.register(websocketPlugin);
server.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (socket, req) => { });
});

// Private User routes
server.register(multipart, {
    limits: {
        fileSize: 500 * 1024, // 500 KB
    },
});

// Register your routes
// registerRoutes(server);
server.register(registerRoutes)

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
