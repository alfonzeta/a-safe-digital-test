import { FastifyInstance } from 'fastify';
import { createUserSchema, deleteUserSchema, getUserSchema, updateUserSchema } from '../infrastructure/controllers/userSchemas';
import { container } from './di';

export const registerRoutes = (fastify: FastifyInstance) => {
  const { userController, postController, webSocketController } = container.controllers;

  // User routes
  fastify.get<{ Params: { id: string } }>('/users/:id', {schema: getUserSchema}, (request, reply) => userController.getUser(request, reply));
  fastify.post<{ Body: { name: string, email: string } }>('/users', {schema: createUserSchema}, (request, reply) => userController.createUser(request, reply));
  fastify.put<{ Params: { id: string }, Body: { name: string, email: string } }>('/users/:id',  {schema: updateUserSchema}, (request, reply) => userController.updateUser(request, reply));
  fastify.delete<{ Params: { id: string } }>('/users/:id',  {schema: deleteUserSchema}, (request, reply) => userController.deleteUser(request, reply));

  // Post routes
  fastify.get<{ Params: { id: string } }>('/posts/:id', async (request, reply) => postController.getPost(request, reply));
  fastify.post<{ Body: { title: string, content: string, userId: number } }>('/posts', async (request, reply) => postController.createPost(request, reply));
  fastify.put<{ Params: { id: string }, Body: { title: string, content: string } }>('/posts/:id', async (request, reply) => postController.updatePost(request, reply));
  fastify.delete<{ Params: { id: string } }>('/posts/:id', async (request, reply) => postController.deletePost(request, reply));

  webSocketController.setup(fastify);
};
