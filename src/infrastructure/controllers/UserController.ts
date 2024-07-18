// UserController.ts

import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserUseCase } from '../../application/usecases/User/CreateUserUseCase';
import { DeleteUserUseCase } from '../../application/usecases/User/DeleteUserUseCase';
import { GetUserUseCase } from '../../application/usecases/User/GetUserUseCase';
import { UpdateUserUseCase } from '../../application/usecases/User/UpdateUserUseCase';

interface Params {
    id: string;
}

export class UserController {
    constructor(
        private readonly getUserUseCase: GetUserUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase
    ) {}

    async getUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as Params;
            const userId = parseInt(params.id, 10);
            
            const user = await this.getUserUseCase.execute(userId);
            if (!user) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }
            reply.send(user);
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async createUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { name, email } = request.body as { name: string; email: string };
            const createdUser = await this.createUserUseCase.execute(name, email);
            if (!createdUser) {
                reply.code(400).send({ error: 'Email already exists' });
                return;
            }
            reply.code(201).send(createdUser);
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async updateUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as Params;
            const userId = parseInt(params.id, 10);
            const { name, email } = request.body as { name: string; email: string };

            const updatedUser = await this.updateUserUseCase.execute(userId, name, email);
            if (!updatedUser) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }
            reply.send(updatedUser);
        } catch (error) {
            if (error instanceof Error && error.message === 'Email already exists') {
                reply.code(400).send({ error: 'Email already exists' });
            } else {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        }
    }

    async deleteUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as Params;
            const userId = parseInt(params.id, 10);
            const success = await this.deleteUserUseCase.execute(userId);
            if (!success) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }
            reply.code(204).send();
        } catch (error) {
            if (error instanceof Error && error.message === 'Internal Server Error') {
                reply.code(500).send({ error: 'Internal Server Error' });
            } else {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        }
    }
}
