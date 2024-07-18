import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/User'; // Adjust the path as per your project structure
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';

export const CreateUser = async (request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> => {
    const userRepository = new PrismaUserRepository(prisma);

    const { name, email } = request.body as { name: string, email: string };

    try {
        // Check if email already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            reply.code(400).send({ error: 'Email already exists' });
            return;
        }

        // Create a new user
        const newUser = new User(null, name, email); // Assuming User constructor takes (id, name, email)
        const createdUser = await userRepository.create(newUser);

        // Respond with the created user
        reply.code(201).send({
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
};
