// Import necessary modules and dependencies
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository'; // Adjust the path based on your project structure

// Define the type of request parameters
interface DeleteUserRequestParams {
    id: string;
}

// Define the deleteUser function
export async function DeleteUser(request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> {
    const userRepository = new PrismaUserRepository(prisma);

    // Type assertion for request.params
    const params = request.params as DeleteUserRequestParams;
    const userId = parseInt(params.id, 10);

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
}
