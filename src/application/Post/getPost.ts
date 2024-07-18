// getPost.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaPostRepository } from '../../infrastructure/repositories/PrismaPostRepository';

// Define interface for route parameters
interface Params {
    id: string;
}

export const GetPost = async (request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> => {
    const postRepository = new PrismaPostRepository(prisma);

    // Type assertion to ensure 'Params' structure
    const params = request.params as Params;
    const postId = parseInt(params.id, 10);

    try {
        // Fetch post from repository
        const post = await postRepository.findById(postId);

        if (!post) {
            reply.code(404).send({ error: 'Post not found' });
            return;
        }

        // Respond with the found post
        reply.send({
            id: post.id,
            title: post.title,
            content: post.content,
            userId: post.userId
        });
    } catch (error) {
        console.error('Error retrieving post:', error);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
};
