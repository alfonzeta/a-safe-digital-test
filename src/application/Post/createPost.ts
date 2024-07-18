import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Post } from '../../domain/Post'; // Adjust the path as per your project structure
import { PrismaPostRepository } from '../../infrastructure/repositories/PrismaPostRepository';

export const CreatePost = async (request: FastifyRequest, reply: FastifyReply, prisma: PrismaClient): Promise<void> => {
    const postRepository = new PrismaPostRepository(prisma);

    const { title, content, userId } = request.body as { title: string, content: string, userId: number };

    try {
        // Create a new user
        const newPost = new Post(null, title, content, null, userId); // Assuming User constructor takes (id, name, email)
        const createdPost = await postRepository.create(newPost);

        // Respond with the created user
        reply.code(201).send({
            id: createdPost.id,
            title: createdPost.title,
            content: createdPost.content,
            userId: createdPost.userId
        });
    } catch (error) {
        console.error('Error creating user:', error);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
};
