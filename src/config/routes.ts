import { FastifyInstance } from 'fastify';
import { createUserSchema, deleteUserSchema, getUserSchema, updateUserSchema, signInSchema, createAdminSchema, uploadProfilePictureSchema, getProfilePictureSchema } from '../infrastructure/controllers/userSchemas';
import { createPostSchema, deletePostSchema, getPostSchema, updatePostSchema } from '../infrastructure/controllers/postSchemas';
import { authMiddleware } from '../infrastructure/middleware/authMiddleware';
import { container } from './di';

export default async function registerRoutes(fastify: FastifyInstance) {
  const { userController, postController } = container.controllers;
  // Open User routes
  fastify.get<{ Params: { id: string } }>('/users/:id', { schema: getUserSchema }, (request, reply) => userController.getUser(request, reply));
  fastify.post<{ Body: { email: string, password: string } }>('/users/signin', { schema: signInSchema }, (request, reply) => userController.signIn(request, reply));
  fastify.post<{ Body: { name: string, email: string, password: string } }>('/users/signup', { schema: createUserSchema }, (request, reply) => userController.createUser(request, reply));
  // Private User routes
  fastify.post<{ Body: { picture: any } }>('/users/profile-picture', { preHandler: authMiddleware(1), schema: uploadProfilePictureSchema }, (request, reply) => userController.uploadProfilePicture(request, reply));
  fastify.get<{ Body: { picture: any } }>('/users/profile-picture', { preHandler: authMiddleware(1), schema: getProfilePictureSchema }, (request, reply) => userController.getProfilePicture(request, reply));
  fastify.put<{ Params: { id: string }, Body: { name: string, email: string, password?: string } }>('/users/:id', { preHandler: authMiddleware(1), schema: updateUserSchema }, (request, reply) => userController.updateUser(request, reply));
  fastify.post<{ Body: { name: string, email: string, password: string } }>('/users/signup/admin', { preHandler: authMiddleware(1), schema: createAdminSchema }, (request, reply) => userController.createAdmin(request, reply));
  fastify.delete<{ Params: { id: string } }>('/users/:id', { preHandler: authMiddleware(1), schema: deleteUserSchema }, (request, reply) => userController.deleteUser(request, reply));

  // Open post routes
  fastify.get<{ Params: { id: string } }>('/posts/:id', { schema: getPostSchema }, async (request, reply) => postController.getPost(request, reply));
  fastify.post<{ Body: { title: string, content: string, userId: number } }>('/posts', { schema: createPostSchema }, async (request, reply) => postController.createPost(request, reply));
  // Private post routes
  fastify.put<{ Params: { id: string }, Body: { title: string, content: string } }>('/posts/:id', { preHandler: authMiddleware(1), schema: updatePostSchema }, async (request, reply) => postController.updatePost(request, reply));
  fastify.delete<{ Params: { id: string } }>('/posts/:id', { preHandler: authMiddleware(1), schema: deletePostSchema }, async (request, reply) => postController.deletePost(request, reply));


};
