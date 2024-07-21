"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const client_1 = require("@prisma/client");
const JwtService_1 = require("../infrastructure/services/JwtService");
const CreateUserUseCase_1 = require("../application/usecases/User/CreateUserUseCase");
const DeleteUserUseCase_1 = require("../application/usecases/User/DeleteUserUseCase");
const GetUserUseCase_1 = require("../application/usecases/User/GetUserUseCase");
const UpdateUserUseCase_1 = require("../application/usecases/User/UpdateUserUseCase");
const SignInUseCase_1 = require("../application/usecases/User/SignInUseCase");
const SignUpUseCase_1 = require("../application/usecases/User/SignUpUseCase");
const CreateAdminUseCase_1 = require("../application/usecases/User/CreateAdminUseCase");
const CreatePostUseCase_1 = require("../application/usecases/Post/CreatePostUseCase");
const DeletePostUseCase_1 = require("../application/usecases/Post/DeletePostUseCase");
const GetPostUseCase_1 = require("../application/usecases/Post/GetPostUseCase");
const UpdatePostUseCase_1 = require("../application/usecases/Post/UpdatePostUseCase");
const PostController_1 = require("../infrastructure/controllers/PostController");
const UserController_1 = require("../infrastructure/controllers/UserController");
const WebSocketController_1 = require("../infrastructure/controllers/WebSocketController");
const PrismaPostRepository_1 = require("../infrastructure/persistence/PrismaPostRepository");
const PrismaUserRepository_1 = require("../infrastructure/persistence/PrismaUserRepository");
// Clients
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: "postgres://postgres:password@localhost:5432/mydatabase"
            // url: process.env.DATABASE_URL,
        },
    },
});
// Repositories
const postRepository = new PrismaPostRepository_1.PrismaPostRepository(prisma);
const userRepository = new PrismaUserRepository_1.PrismaUserRepository(prisma);
// Services
const jwtService = new JwtService_1.JwtService();
// Use cases
const getUserUseCase = new GetUserUseCase_1.GetUserUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase_1.CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase_1.UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase_1.DeleteUserUseCase(userRepository);
const signInUseCase = new SignInUseCase_1.SignInUseCase(userRepository, jwtService);
const signUpUseCase = new SignUpUseCase_1.SignUpUseCase(userRepository);
const createAdminUseCase = new CreateAdminUseCase_1.CreateAdminUseCase(userRepository);
const createPostUseCase = new CreatePostUseCase_1.CreatePostUseCase(postRepository);
const deletePostUseCase = new DeletePostUseCase_1.DeletePostUseCase(postRepository);
const getPostUseCase = new GetPostUseCase_1.GetPostUseCase(postRepository);
const updatePostUseCase = new UpdatePostUseCase_1.UpdatePostUseCase(postRepository);
// Controllers
// http
const postController = new PostController_1.PostController(createPostUseCase, deletePostUseCase, getPostUseCase, updatePostUseCase);
const userController = new UserController_1.UserController(getUserUseCase, updateUserUseCase, deleteUserUseCase, signInUseCase, signUpUseCase, createAdminUseCase);
// websockets
const webSocketController = new WebSocketController_1.WebSocketController();
exports.container = {
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
        updatePostUseCase,
        signInUseCase,
        createAdminUseCase
    },
    controllers: {
        userController,
        postController,
        webSocketController
    },
    services: {
        jwtService
    }
};
