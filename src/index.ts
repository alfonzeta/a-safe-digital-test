// Import necessary dependencies
import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { User } from './domain/User';
import { getUserSchema } from './schemas/userSchemas'; // Import the get user schema
import { createUserSchema } from './schemas/userSchemas';
import { updateUserSchema } from './schemas/userSchemas';
import { deleteUserSchema } from './schemas/userSchemas'; // Import the delete schema





// Initialize Fastify server and Prisma client
const server = fastify();
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgres://postgres:password@localhost:5432/mydatabase"
            // url: process.env.DATABASE_URL,
        },
    },
});
const userRepository = new PrismaUserRepository(); // Instantiate repository

// Define server routes
server.get('/ping', async (request, reply) => {
    return 'pong\n';
});
server.get<{ Params: { id: string } }>('/users/:id', { schema: getUserSchema }, async (request, reply) => {
    const userId = parseInt(request.params.id, 10);

    try {
        // Fetch user from repository
        const user = await userRepository.findById(userId);

        if (!user) {
            reply.code(404).send({ error: 'User not found' });
            return;
        }

        // Respond with the found user
        reply.send({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

server.post<{ Body: { name: string, email: string } }>('/users', { schema: createUserSchema }, async (request, reply) => {
    const { name, email } = request.body;

    try {
        // Create a new user
        const newUser = new User(null, name, email);
        const createdUser = await userRepository.create(newUser);

        // Respond with the created user
        reply.code(201).send({
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Email already exists') {
            reply.code(400).send({ error: 'Email already exists' });
        } else {
            console.error('Error creating user:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
});


server.put<{ Params: { id: string }, Body: { name: string, email: string } }>('/users/:id', { schema: updateUserSchema }, async (request, reply) => {
    const userId = parseInt(request.params.id, 10);
    const { name, email } = request.body;

    try {
        // Check if the user exists
        const existingUser = await userRepository.findById(userId);

        if (!existingUser) {
            reply.code(404).send({ error: 'User not found' });
            return;
        }

        // Update the user
        const updatedUser = new User(userId, name, email);
        const user = await userRepository.update(updatedUser);

        // Respond with the updated user
        reply.send({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Email already exists') {
            reply.code(400).send({ error: 'Email already exists' });
        } else {
            console.error('Error updating user:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
});

server.delete<{ Params: { id: string } }>('/users/:id', { schema: deleteUserSchema }, async (request, reply) => {
    const userId = parseInt(request.params.id, 10);

    try {
        // Delete the user
        await userRepository.delete(userId);

        // Respond with 204 No Content on successful deletion
        reply.code(204).send();
    } catch (error) {
        // Handle specific error when user is not found
        if (error instanceof Error && error.message === 'User not found') {
            reply.code(404).send({ error: 'User not found' });
        } else {
            // Handle other unexpected errors
            console.error('Error deleting user:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
});

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
