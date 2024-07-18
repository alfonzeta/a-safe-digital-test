import { PrismaClient } from '@prisma/client';

import { CreateUserUseCase } from '../application/usecases/User/CreateUserUseCase';
import { DeleteUserUseCase } from '../application/usecases/User/DeleteUserUseCase';
import { GetUserUseCase } from '../application/usecases/User/GetUserUseCase';
import { UpdateUserUseCase } from '../application/usecases/User/UpdateUserUseCase';

import { CreatePostUseCase } from '../application/usecases/Post/CreatePostUseCase';
import { DeletePostUseCase } from '../application/usecases/Post/DeletePostUseCase';
import { GetPostUseCase } from '../application/usecases/Post/GetPostUseCase';
import { UpdatePostUseCase } from '../application/usecases/Post/UpdatePostUseCase';

import { PostController } from '../infrastructure/controllers/PostController';
import { UserController } from '../infrastructure/controllers/UserController';
import { PrismaPostRepository } from '../infrastructure/persistence/PrismaPostRepository';
import { PrismaUserRepository } from '../infrastructure/persistence/PrismaUserRepository';

// Clients
const prisma = new PrismaClient({
  datasources: {
    db: {
        url: "postgres://postgres:password@localhost:5432/mydatabase"
        // url: process.env.DATABASE_URL,
    },
  },
});

// Repositories
const postRepository = new PrismaPostRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

// Use cases
const getUserUseCase = new GetUserUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

const createPostUseCase = new CreatePostUseCase(postRepository);
const deletePostUseCase = new DeletePostUseCase(postRepository);
const getPostUseCase = new GetPostUseCase(postRepository);
const updatePostUseCase = new UpdatePostUseCase(postRepository);

// Controllers
const postController = new PostController(
  createPostUseCase,
  deletePostUseCase,
  getPostUseCase,
  updatePostUseCase,
);
const userController = new UserController(
  getUserUseCase,
  createUserUseCase,
  updateUserUseCase,
  deleteUserUseCase
);

export const container = {
  prisma,
  repositories: {
    userRepository,
    postRepository
  },
  useCases: {
    getUserUseCase,
    createUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    createPostUseCase,
    deletePostUseCase,
    getPostUseCase,
    updatePostUseCase
  },
  controllers: {
    userController,
    postController
  }
};
