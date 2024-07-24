import { FastifyReply, FastifyRequest } from 'fastify';
import { UserController } from '../UserController';
import { GetUserUseCase } from '../../../application/usecases/User/GetUserUseCase';
import { UpdateUserUseCase } from '../../../application/usecases/User/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../../application/usecases/User/DeleteUserUseCase';
import { SignInUseCase } from '../../../application/usecases/User/SignInUseCase';
import { SignUpUseCase } from '../../../application/usecases/User/SignUpUseCase';
import { CreateAdminUseCase } from '../../../application/usecases/User/CreateAdminUseCase';
import { Readable } from 'stream';

// Mock AWS SDK
jest.mock('aws-sdk', () => {
    const S3 = {
        upload: jest.fn().mockImplementation((params, callback) => callback(null, { Location: 'mock-url' })),
        getObject: jest.fn().mockImplementation((params, callback) => callback(null, { Body: Buffer.from('mock-data'), ContentType: 'image/jpeg' }))
    };

    return {
        config: {
            update: jest.fn() // Mocking the `update` method of `config`
        },
        S3: jest.fn(() => S3),
        Endpoint: jest.fn() // Mocking Endpoint to avoid constructor issues
    };
});
describe('UserController', () => {
    let userController: UserController;
    let getUserUseCase: GetUserUseCase;
    let updateUserUseCase: UpdateUserUseCase;
    let deleteUserUseCase: DeleteUserUseCase;
    let signInUseCase: SignInUseCase;
    let signUpUseCase: SignUpUseCase;
    let createAdminUseCase: CreateAdminUseCase;
    let mockReply: FastifyReply;
    let mockRequest: FastifyRequest;

    beforeEach(() => {
        getUserUseCase = { execute: jest.fn() } as unknown as GetUserUseCase;
        updateUserUseCase = { execute: jest.fn() } as unknown as UpdateUserUseCase;
        deleteUserUseCase = { execute: jest.fn() } as unknown as DeleteUserUseCase;
        signInUseCase = { execute: jest.fn() } as unknown as SignInUseCase;
        signUpUseCase = { execute: jest.fn() } as unknown as SignUpUseCase;
        createAdminUseCase = { execute: jest.fn() } as unknown as CreateAdminUseCase;

        userController = new UserController(
            getUserUseCase,
            updateUserUseCase,
            deleteUserUseCase,
            signInUseCase,
            signUpUseCase,
            createAdminUseCase
        );

        mockReply = {
            code: jest.fn().mockReturnThis(),
            header: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as FastifyReply;

        mockRequest = {
            user: { id: '123', name: 'John Doe' },
            file: jest.fn().mockResolvedValue({
                filename: 'profile-pic.jpg',
                mimetype: 'image/jpeg',
                file: Readable.from(Buffer.from('mock image data')),
                truncated: false
            })
        } as unknown as FastifyRequest;
    });

    describe('getProfilePicture', () => {
        it('should get a profile picture and return it', async () => {
            const request = {
                user: { id: 1 }
            } as unknown as FastifyRequest;

            await userController.getProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(200);
            // expect(mockReply.header).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
            expect(mockReply.send).toHaveBeenCalledWith(Buffer.from('mock-data'));
        });

        it('should return 401 if user ID is not provided', async () => {
            const request = { user: {} } as unknown as FastifyRequest;

            await userController.getProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });


    });
    describe('uploadProfilePicture', () => {
        it('should successfully upload a file and return the file location', async () => {
            // Mock FastifyRequest and FastifyReply
            const request = {
                user: { id: '123', name: 'test-user' },
                file: jest.fn().mockResolvedValue({
                    filename: 'test-image.jpg',
                    mimetype: 'image/jpeg',
                    file: Buffer.from('file-content'),
                    truncated: false,
                }),
            } as unknown as FastifyRequest;

            const reply = {
                code: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as FastifyReply;

            await userController.uploadProfilePicture(request, reply);

            expect(reply.code).not.toHaveBeenCalledWith(401);
            expect(reply.code).not.toHaveBeenCalledWith(400);
            expect(reply.code).not.toHaveBeenCalledWith(413);
            expect(reply.code).not.toHaveBeenCalledWith(415);
            expect(reply.code).toHaveBeenCalledWith(200);
            expect(reply.send).toHaveBeenCalledWith({
                message: 'Profile picture uploaded successfully',
                location: 'mock-url',
            });
        });

        it('should return 413 if file size exceeds limit', async () => {
            const request = {
                user: { id: '1', name: 'John Doe' },
                file: jest.fn().mockResolvedValue({
                    file: { truncated: true },
                    mimetype: 'image/jpeg'
                })
            } as unknown as FastifyRequest;

            const reply = {
                code: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as FastifyReply;

            await userController.uploadProfilePicture(request, reply);

            expect(reply.code).toHaveBeenCalledWith(413);
            expect(reply.send).toHaveBeenCalledWith({ error: 'File size exceeds the 500 KB limit' });
        });



        it('should return 400 if no file is uploaded', async () => {
            const request = {
                user: { id: 1 },
                file: jest.fn().mockResolvedValue(null)
            } as unknown as FastifyRequest;

            await userController.uploadProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'No file uploaded' });
        });


        it('should return 415 for unsupported file types', async () => {
            const request = {
                user: { id: 1 },
                file: jest.fn().mockResolvedValue({
                    filename: 'file.txt',
                    file: Buffer.from('file-content'),
                    mimetype: 'text/plain',
                    truncated: false
                })
            } as unknown as FastifyRequest;

            await userController.uploadProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(415);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unsupported Media Type' });
        });
    });

    describe('updateUser', () => {
        it('should return 400 if user ID is invalid', async () => {
            const mockRequest = {
                params: { id: 'invalid' },
                body: {}
            } as unknown as FastifyRequest;

            await userController.updateUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 401 if user is not authenticated', async () => {
            const mockRequest = {
                params: { id: '1' },
                body: {},
                user: null
            } as unknown as FastifyRequest;

            await userController.updateUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should return 403 if user tries to update another user\'s info and is not an admin', async () => {
            const mockRequest = {
                params: { id: '2' },
                body: { name: 'New Name', email: 'new@example.com', password: 'newpassword', roleId: 2 },
                user: { id: '1', roleId: 2 }
            } as unknown as FastifyRequest;

            await userController.updateUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(403);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Forbidden' });
        });

        it('should return 403 if user tries to change others roleId without admin privileges', async () => {
            const request = {
                params: { id: '2' },
                body: { name: 'Updated User', email: 'user@example.com', password: 'newpassword', roleId: 2 },
                user: { id: '1', roleId: 2 } // Non-admin user
            } as unknown as FastifyRequest;

            const reply = {
                code: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as FastifyReply;

            await userController.updateUser(request, reply);

            expect(reply.code).toHaveBeenCalledWith(403);
            expect(reply.send).toHaveBeenCalledWith({ error: 'Forbidden' });
        });



        it('should return 404 if user to update is not found', async () => {
            const mockRequest = {
                params: { id: '1' },
                body: { name: 'New Name', email: 'new@example.com', password: 'newpassword', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            (updateUserUseCase.execute as jest.Mock).mockResolvedValue(null);

            await userController.updateUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should return 200 and updated user details on success', async () => {
            const mockRequest = {
                params: { id: '1' },
                body: { name: 'Updated Name', email: 'updated@example.com', password: 'updatedpassword', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            const updatedUser = { id: 1, name: 'Updated Name', email: 'updated@example.com', roleId: 1 };
            (updateUserUseCase.execute as jest.Mock).mockResolvedValue(updatedUser);

            await userController.updateUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(updatedUser);
        });

        it('should return 400 if email already exists', async () => {
            const mockRequest = {
                params: { id: '1' },
                body: { name: 'Name', email: 'existing@example.com', password: 'password', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            (updateUserUseCase.execute as jest.Mock).mockRejectedValue(new Error('Email already exists'));

            await userController.updateUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Email already exists' });
        });

        it('should return 500 on internal server error', async () => {
            const mockRequest = {
                params: { id: '1' },
                body: { name: 'Name', email: 'error@example.com', password: 'password', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            (updateUserUseCase.execute as jest.Mock).mockRejectedValue(new Error('Some other error'));

            await userController.updateUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('deleteUser', () => {
        it('should return 204 on successful deletion', async () => {
            const mockRequest = {
                params: { id: '1' },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            (deleteUserUseCase.execute as jest.Mock).mockResolvedValue(true);

            await userController.deleteUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(204);
            expect(mockReply.send).not.toHaveBeenCalled(); // 204 response should not include a body
        });

        it('should return 400 for invalid user ID format', async () => {
            const request = {
                params: { id: 'invalid' }
            } as unknown as FastifyRequest;

            await userController.deleteUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 404 if user to delete is not found', async () => {
            const mockRequest = {
                params: { id: '1' },
                user: { id: '1', roleId: 1 } // Admin user
            } as unknown as FastifyRequest;

            (deleteUserUseCase.execute as jest.Mock).mockResolvedValue(false);

            await userController.deleteUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should return 500 for unexpected errors', async () => {
            const mockRequest = {
                params: { id: '1' },
                user: { id: '1', roleId: 1 } // Admin user
            } as unknown as FastifyRequest;

            (deleteUserUseCase.execute as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

            await userController.deleteUser(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });


    describe('getUser', () => {
        it('should return a user and 200 status', async () => {
            const request = {
                params: { id: '1' }
            } as unknown as FastifyRequest;
            const mockUser = { id: 1, name: 'John Doe' };

            // Mock the use case to return a user
            (getUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

            // Call the method
            await userController.getUser(request, mockReply);

            // Assertions
            expect(getUserUseCase.execute).toHaveBeenCalledWith(1);
            expect(mockReply.code).toHaveBeenCalledWith(200); // Verify code was called with 200
            expect(mockReply.send).toHaveBeenCalledWith(mockUser); // Verify send was called with the user object
        });
        it('should return 400 for invalid user ID format', async () => {
            const request = {
                params: { id: 'invalid' }
            } as unknown as FastifyRequest;

            await userController.getUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 404 if user is not found', async () => {
            const request = {
                params: { id: '1' }
            } as unknown as FastifyRequest;
            (getUserUseCase.execute as jest.Mock).mockResolvedValue(null);

            await userController.getUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle and respond with status 500 on error', async () => {
            const request = {
                params: { id: '1' }
            } as unknown as FastifyRequest;
            (getUserUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await userController.getUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('createUser', () => {
        it('should create a user and return 201 status', async () => {
            const request = {
                body: { name: 'Jane Doe', email: 'jane@example.com', password: 'password', roleId: 2 }
            } as unknown as FastifyRequest;
            const mockUser = { id: 1, name: 'Jane Doe' };
            (signUpUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

            await userController.createUser(request, mockReply);

            expect(signUpUseCase.execute).toHaveBeenCalledWith('Jane Doe', 'jane@example.com', 'password', 2);
            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockUser);
        });

        it('should return 400 for email already exists error', async () => {
            const request = {
                body: { name: 'Jane Doe', email: 'jane@example.com', password: 'password', roleId: 2 }
            } as unknown as FastifyRequest;
            (signUpUseCase.execute as jest.Mock).mockRejectedValue(new Error('Email already exists'));

            await userController.createUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Email already exists' });
        });

        it('should return 404 for missing password', async () => {
            const request = {
                body: { name: 'Jane Doe', email: 'jane@example.com', password: '', roleId: 2 }
            } as unknown as FastifyRequest;
            (signUpUseCase.execute as jest.Mock).mockRejectedValue(new Error('Password is required'));

            await userController.createUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Password is required' });
        });

        it('should handle and respond with status 500 on error', async () => {
            const request = {
                body: { name: 'Jane Doe', email: 'jane@example.com', password: 'password', roleId: 2 }
            } as unknown as FastifyRequest;
            (signUpUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await userController.createUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('createAdmin', () => {
        it('should return 201 and created admin user details on success', async () => {
            const mockRequest = {
                body: { name: 'Admin', email: 'admin@example.com', password: 'password', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            const createdAdmin = { id: '2', name: 'Admin', email: 'admin@example.com', roleId: 1 };
            (createAdminUseCase.execute as jest.Mock).mockResolvedValue(createdAdmin);

            await userController.createAdmin(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(createdAdmin);
        });

        it('should return 400 if email already exists', async () => {
            const mockRequest = {
                body: { name: 'Admin', email: 'admin@example.com', password: 'password', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            (createAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error('Email already exists'));

            await userController.createAdmin(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Email already exists' });
        });

        it('should return 404 if password is not provided', async () => {
            const mockRequest = {
                body: { name: 'Admin', email: 'admin@example.com', password: '', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            (createAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error('Password is required'));

            await userController.createAdmin(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Password is required' });
        });


        it('should return 500 for other errors', async () => {
            const mockRequest = {
                body: { name: 'Admin', email: 'admin@example.com', password: 'password', roleId: 1 },
                user: { id: '1', roleId: 1 }
            } as unknown as FastifyRequest;

            (createAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error('Some other error'));

            await userController.createAdmin(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('signIn', () => {
        it('should return user token and status 200', async () => {
            const request = {
                body: { email: 'user@example.com', password: 'password' }
            } as unknown as FastifyRequest;
            const mockUser = { token: 'mockToken' };
            (signInUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

            await userController.signIn(request, mockReply);

            expect(signInUseCase.execute).toHaveBeenCalledWith('user@example.com', 'password');
            expect(mockReply.send).toHaveBeenCalledWith(mockUser.token);
        });

        it('should return 401 for invalid email or password', async () => {
            const request = {
                body: { email: 'user@example.com', password: 'wrongPassword' }
            } as unknown as FastifyRequest;
            (signInUseCase.execute as jest.Mock).mockResolvedValue(null);

            await userController.signIn(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid email or password' });
        });

        it('should handle and respond with status 500 on error', async () => {
            const request = {
                body: { email: 'user@example.com', password: 'password' }
            } as unknown as FastifyRequest;
            (signInUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await userController.signIn(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });
});
