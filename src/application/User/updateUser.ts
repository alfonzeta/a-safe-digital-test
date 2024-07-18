// updateUser.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/User'; // Adjust the path based on your project structure
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository'; // Adjust the path based on your project structure

interface UpdateUserRequestParams {
    id: string;
}

interface UpdateUserRequestBody {
    name: string;
    email: string;
}

export async function UpdateUser(request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> {
    const userRepository = new PrismaUserRepository(prisma);

    // Type assertion for request.params and request.body
    const params = request.params as UpdateUserRequestParams;
    const body = request.body as UpdateUserRequestBody;

    const userId = parseInt(params.id, 10);
    const { name, email } = body;

    try {
        // Check if the user exists
        const existingUser = await userRepository.findById(userId);

        if (!existingUser) {
            reply.code(404).send({ error: 'User not found' });
            return;
        }

        // Update the user
        existingUser.name = name;
        existingUser.email = email;
        const updatedUser = await userRepository.update(existingUser);

        // Respond with the updated user
        reply.send({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Email already exists') {
            reply.code(400).send({ error: 'Email already exists' });
        } else {
            console.error('Error updating user:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
}
