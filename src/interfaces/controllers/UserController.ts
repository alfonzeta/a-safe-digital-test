// UserController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { GetUser } from '../../application/User/getUser';
import { CreateUser } from '../../application/User/createUser';
import { UpdateUser } from '../../application/User/updateUser';
import { DeleteUser } from '../../application/User/deleteUser';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';

export class UserController {
    private readonly getUserHandler: typeof GetUser;
    private readonly createUserHandler: typeof CreateUser;
    private readonly updateUserHandler: typeof UpdateUser;
    private readonly deleteUserHandler: typeof DeleteUser; // Define deleteUserHandler

    constructor(private readonly prisma: PrismaClient) {
        this.getUserHandler = GetUser;
        this.createUserHandler = CreateUser;
        this.updateUserHandler = UpdateUser;
        this.deleteUserHandler = DeleteUser; // Initialize deleteUserHandler
    }

    async getUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.getUserHandler(request, reply, this.prisma);
    }

    async createUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.createUserHandler(request, reply, this.prisma);
    }

    async updateUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.updateUserHandler(request, reply, this.prisma);
    }

    async deleteUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        await this.deleteUserHandler(request, reply, this.prisma);
    }
}
