import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { userRoutes } from './interfaces/routes/userRoutes';

const server = fastify();
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgres://postgres:password@localhost:5432/mydatabase"
            // url: process.env.DATABASE_URL,
        },
    },
});

// Register routes
import { UserController } from './interfaces/controllers/UserController';
const userController = new UserController(prisma);
userRoutes(server, userController);

// Start the server
server.listen(8080, "0.0.0.0", async (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);

    try {
        await prisma.$connect();
        console.log('Connected to database');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
});
