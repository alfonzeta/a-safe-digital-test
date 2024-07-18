import { Prisma, PrismaClient } from '@prisma/client';
import { Post } from "../../domain/Post";
import { PostRepository } from "../../domain/PostRepository";

export class PrismaPostRepository implements PostRepository {
    constructor(private prisma: PrismaClient) { }

    async create(post: Post): Promise<Post> {
        try {
            const createdPost = await this.prisma.post.create({
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
            throw error;
        }
    }

    async findById(id: number): Promise<Post | null> {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id },
            });
            if (!post) return null;
            return new Post(post.id, post.title, post.content, post.createdAt, post.userId);
        } catch (error) {
            throw error;
        }
    }

    async update(post: Post): Promise<Post> {
        try {
            const updatedPost = await this.prisma.post.update({
                where: { id: post.id as number },
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
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.post.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Post not found');
                }
            }
            throw error;
        }
    }
}