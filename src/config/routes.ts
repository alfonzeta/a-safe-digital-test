import { FastifyInstance } from 'fastify';
import { createUserSchema, deleteUserSchema, getUserSchema, updateUserSchema, signInSchema } from '../infrastructure/controllers/userSchemas';
import { authMiddleware } from '../infrastructure/middleware/authMiddleware';
import { container } from './di';

export const registerRoutes = (fastify: FastifyInstance) => {
  const { userController, postController, webSocketController } = container.controllers;

  // Open User routes
  fastify.get<{ Params: { id: string } }>('/users/:id', { schema: getUserSchema }, (request, reply) => userController.getUser(request, reply));
  fastify.post<{ Body: { name: string, email: string, password: string } }>('/users/signup', { schema: createUserSchema }, (request, reply) => userController.createUser(request, reply));
  fastify.post<{ Body: { name: string, email: string, password: string } }>('/users', { schema: createUserSchema }, (request, reply) => userController.createUser(request, reply));
  fastify.post<{ Body: { email: string, password: string } }>('/users/signin', { schema: signInSchema }, (request, reply) => userController.signIn(request, reply));
  // Private User routes
  fastify.post<{ Body: { name: string, email: string, password: string } }>('/users/signup/admin', { preHandler: authMiddleware(1), schema: createUserSchema }, (request, reply) => userController.createAdmin(request, reply));
  fastify.put<{ Params: { id: string }, Body: { name: string, email: string, password?: string } }>('/users/:id', { preHandler: authMiddleware(1), schema: updateUserSchema }, (request, reply) => userController.updateUser(request, reply));

  fastify.delete<{ Params: { id: string } }>('/users/:id', { preHandler: authMiddleware(1), schema: deleteUserSchema }, (request, reply) => userController.deleteUser(request, reply));

  // Open post routes
  fastify.get<{ Params: { id: string } }>('/posts/:id', async (request, reply) => postController.getPost(request, reply));
  fastify.post<{ Body: { title: string, content: string, userId: number } }>('/posts', async (request, reply) => postController.createPost(request, reply));
  // Private post routes
  fastify.put<{ Params: { id: string }, Body: { title: string, content: string } }>('/posts/:id', { preHandler: authMiddleware(1) }, async (request, reply) => postController.updatePost(request, reply));
  fastify.delete<{ Params: { id: string } }>('/posts/:id', { preHandler: authMiddleware(1) }, async (request, reply) => postController.deletePost(request, reply));

  webSocketController.setup(fastify);
};
