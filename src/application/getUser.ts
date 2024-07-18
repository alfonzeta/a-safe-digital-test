import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';

// Define interface for route parameters
interface Params {
    id: string;
}

export const GetUser = async (request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> => {
    const userRepository = new PrismaUserRepository(prisma);

    // Type assertion to ensure 'Params' structure
    const params = request.params as { id: string };
    const userId = parseInt(params.id, 10);

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
};
