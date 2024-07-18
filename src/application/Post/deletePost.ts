// deletePost.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaPostRepository } from '../../infrastructure/repositories/PrismaPostRepository'; // Adjust the path based on your project structure

// Define the type of request parameters
interface DeletePostRequestParams {
    id: string;
}

// Define the deletePost function
export const DeletePost = async (request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> => {
    const postRepository = new PrismaPostRepository(prisma);

    // Type assertion for request.params
    const params = request.params as DeletePostRequestParams;
    const postId = parseInt(params.id, 10);

    try {
        // Delete the post
        await postRepository.delete(postId);

        // Respond with 204 No Content on successful deletion
        reply.code(204).send();
    } catch (error) {
        // Handle specific error when post is not found
        if (error instanceof Error && error.message === 'Post not found') {
            reply.code(404).send({ error: 'Post not found' });
        } else {
            // Handle other unexpected errors
            console.error('Error deleting post:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
};
