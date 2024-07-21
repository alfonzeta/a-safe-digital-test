"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const userSchemas_1 = require("../infrastructure/controllers/userSchemas");
const postSchemas_1 = require("../infrastructure/controllers/postSchemas");
const authMiddleware_1 = require("../infrastructure/middleware/authMiddleware");
const di_1 = require("./di");
const registerRoutes = (fastify) => {
    const { userController, postController, webSocketController } = di_1.container.controllers;
    // Open User routes
    fastify.get('/users/:id', { schema: userSchemas_1.getUserSchema }, (request, reply) => userController.getUser(request, reply));
    fastify.post('/users/signup', { schema: userSchemas_1.createUserSchema }, (request, reply) => userController.createUser(request, reply));
    fastify.post('/users', { schema: userSchemas_1.createUserSchema }, (request, reply) => userController.createUser(request, reply));
    fastify.post('/users/signin', { schema: userSchemas_1.signInSchema }, (request, reply) => userController.signIn(request, reply));
    // Private User routes
    fastify.post('/users/profile-picture', { preHandler: (0, authMiddleware_1.authMiddleware)(1) }, (request, reply) => userController.uploadProfilePicture(request, reply));
    fastify.post('/users/signup/admin', { preHandler: (0, authMiddleware_1.authMiddleware)(1), schema: userSchemas_1.createUserSchema }, (request, reply) => userController.createAdmin(request, reply));
    fastify.put('/users/:id', { preHandler: (0, authMiddleware_1.authMiddleware)(1), schema: userSchemas_1.updateUserSchema }, (request, reply) => userController.updateUser(request, reply));
    fastify.delete('/users/:id', { preHandler: (0, authMiddleware_1.authMiddleware)(1), schema: userSchemas_1.deleteUserSchema }, (request, reply) => userController.deleteUser(request, reply));
    // Open post routes
    fastify.get('/posts/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () { return postController.getPost(request, reply); }));
    fastify.post('/posts', { schema: postSchemas_1.createPostSchema }, (request, reply) => __awaiter(void 0, void 0, void 0, function* () { return postController.createPost(request, reply); }));
    // Private post routes
    fastify.put('/posts/:id', { preHandler: (0, authMiddleware_1.authMiddleware)(1), schema: postSchemas_1.updatePostSchema }, (request, reply) => __awaiter(void 0, void 0, void 0, function* () { return postController.updatePost(request, reply); }));
    fastify.delete('/posts/:id', { preHandler: (0, authMiddleware_1.authMiddleware)(1) }, (request, reply) => __awaiter(void 0, void 0, void 0, function* () { return postController.deletePost(request, reply); }));
    webSocketController.setup(fastify);
};
exports.registerRoutes = registerRoutes;
