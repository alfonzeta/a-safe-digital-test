// updatePost.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Post } from '../../domain/Post'; // Adjust the path based on your project structure
import { PrismaPostRepository } from '../../infrastructure/repositories/PrismaPostRepository'; // Adjust the path based on your project structure

// Define the type of request parameters
interface UpdatePostRequestParams {
    id: string;
}

// Define the type of request body
interface UpdatePostRequestBody {
    title: string;
    content: string;
}

export const UpdatePost = async (request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> => {
    const postRepository = new PrismaPostRepository(prisma);

    // Type assertion for request.params and request.body
    const params = request.params as UpdatePostRequestParams;
    const body = request.body as UpdatePostRequestBody;

    const postId = parseInt(params.id, 10);
    const { title, content } = body;

    try {
        // Check if the post exists
        const existingPost = await postRepository.findById(postId);

        if (!existingPost) {
            reply.code(404).send({ error: 'Post not found' });
            return;
        }

        // Update the post
        existingPost.title = title;
        existingPost.content = content;
        const updatedPost = await postRepository.update(existingPost);

        // Respond with the updated post
        reply.send({
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content,
            userId: updatedPost.userId
        });
    } catch (error) {
        console.error('Error updating post:', error);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
};
