import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import {
    getUserSchema,
    createUserSchema,
    updateUserSchema,
    deleteUserSchema,
} from '../../schemas/userSchemas'; // Adjust the import path based on your directory structure

export function userRoutes(server: FastifyInstance, controller: UserController): void {
    server.get('/ping', async (request, reply) => {
        return 'pong\n';
    });

    server.get<{ Params: { id: string } }>('/users/:id', { schema: getUserSchema }, async (request, reply) => {
        return controller.getUser(request, reply);
    });

    server.post<{ Body: { name: string, email: string } }>('/users', { schema: createUserSchema }, async (request, reply) => {
        return controller.createUser(request, reply);
    });

    server.put<{ Params: { id: string }, Body: { name: string, email: string } }>('/users/:id', { schema: updateUserSchema }, async (request, reply) => {
        return controller.updateUser(request, reply);
    });

    server.delete<{ Params: { id: string } }>('/users/:id', { schema: deleteUserSchema }, async (request, reply) => {
        return controller.deleteUser(request, reply);
    });

}
