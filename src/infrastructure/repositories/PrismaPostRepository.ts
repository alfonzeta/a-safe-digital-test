import { PrismaClient } from '@prisma/client';
import { PostRepository } from "../../domain/PostRepository";
import { Post } from "../../domain/Post";
import { prisma } from "../db/client"; // Ensure this path is correct
import { Prisma } from '@prisma/client'; // Import Prisma to handle known errors

export class PrismaPostRepository implements PostRepository {
    constructor(private prisma: PrismaClient) { }

    async create(post: Post): Promise<Post> {
        try {
            const createdPost = await prisma.post.create({
                data: {
                    title: post.title,
                    content: post.content,
                    userId: post.userId,
                    createdAt: new Date(),
                },
            });
            return new Post(createdPost.id, createdPost.title, createdPost.content, createdPost.createdAt, createdPost.userId);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('Post already exists with the same unique identifier');
                }
            }
            throw error; // Rethrow if it's not the known error
        }
    }

    async findById(id: number): Promise<Post | null> {
        try {
            const post = await prisma.post.findUnique({
                where: { id },
            });
            if (!post) return null;
            return new Post(post.id, post.title, post.content, post.createdAt, post.userId);
        } catch (error) {
            throw error; // Re-throw error for further handling
        }
    }

    async update(post: Post): Promise<Post> {
        try {
            const updatedPost = await prisma.post.update({
                where: { id: post.id as number }, // Ensure id is not null
                data: {
                    title: post.title,
                    content: post.content,
                },
            });
            return new Post(updatedPost.id, updatedPost.title, updatedPost.content, updatedPost.createdAt, updatedPost.userId);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('Post already exists with the same unique identifier');
                }
                if (error.code === 'P2025') {
                    throw new Error('Post not found');
                }
            }
            throw error; // Rethrow if it's not the known error
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await prisma.post.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Post not found');
                }
            }
            throw error; // Rethrow if it's not the known error
        }
    }
}

// Usage example
const postRepository = new PrismaPostRepository(prisma);

const newPost = new Post(null, 'My First Post', 'This is the content of my first post.', null, 1);

postRepository.create(newPost).then(createdPost => {
    console.log('Created Post:', createdPost);
});
