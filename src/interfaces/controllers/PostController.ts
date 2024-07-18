// UserController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { GetPost } from '../../application/Post/getPost';
import { CreatePost } from '../../application/Post/createPost';
import { UpdatePost } from '../../application/Post/updatePost';
import { DeletePost } from '../../application/Post/deletePost';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';

export class PostController {
    private readonly getPostHandler: typeof GetPost;
    private readonly createPostHandler: typeof CreatePost;
    private readonly updatePostHandler: typeof UpdatePost;
    private readonly deletePostHandler: typeof DeletePost; // Define deleteUserHandler

    constructor(private readonly prisma: PrismaClient) {
        this.getPostHandler = GetPost;
        this.createPostHandler = CreatePost;
        this.updatePostHandler = UpdatePost;
        this.deletePostHandler = DeletePost;
    }

    async getPost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.getPostHandler(request, reply, this.prisma);
    }

    async createPost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.createPostHandler(request, reply, this.prisma);
    }

    async updatePost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.updatePostHandler(request, reply, this.prisma);
    }

    async deletePost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.deletePostHandler(request, reply, this.prisma);
    }
}
