
import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { userRoutes } from './interfaces/routes/userRoutes';
import { postRoutes } from './interfaces/routes/postRoutes';


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
import { PostController } from './interfaces/controllers/PostController';
const userController = new UserController(prisma);
const postController = new PostController(prisma);
userRoutes(server, userController);
postRoutes(server, postController);

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
