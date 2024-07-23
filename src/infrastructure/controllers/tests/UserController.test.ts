import { FastifyReply, FastifyRequest } from 'fastify';
import { UserController } from '../UserController';
import { GetUserUseCase } from '../../../application/usecases/User/GetUserUseCase';
import { UpdateUserUseCase } from '../../../application/usecases/User/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../../application/usecases/User/DeleteUserUseCase';
import { SignInUseCase } from '../../../application/usecases/User/SignInUseCase';
import { SignUpUseCase } from '../../../application/usecases/User/SignUpUseCase';
import { CreateAdminUseCase } from '../../../application/usecases/User/CreateAdminUseCase';


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

    });

    describe('uploadProfilePicture', () => {
        it('should return 413 if file size exceeds the limit', async () => {
            const request = {
                user: { id: 1 },
                file: jest.fn().mockResolvedValue({
                    filename: 'large-file.jpg',
                    file: Buffer.from('large-file-content'),
                    mimetype: 'image/jpeg',
                    truncated: true // Simulate a truncated file
                })
            } as unknown as FastifyRequest;

            await userController.uploadProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(413);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'File size exceeds the 100 KB limit' });
        });

        it('should upload a profile picture and return success', async () => {
            const request = {
                user: { id: 1 },
                file: jest.fn().mockResolvedValue({
                    filename: 'profile.jpg',
                    file: Buffer.from('file-content'),
                    mimetype: 'image/jpeg',
                    truncated: false
                })
            } as unknown as FastifyRequest;

            await userController.uploadProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ message: 'Profile picture uploaded successfully', location: 'mock-url' });
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

    describe('getProfilePicture', () => {
        it('should get a profile picture and return it', async () => {
            const request = {
                user: { id: 1 }
            } as unknown as FastifyRequest;

            await userController.getProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(200);
            expect(mockReply.header).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
            expect(mockReply.send).toHaveBeenCalledWith(Buffer.from('mock-data'));
        });

        it('should return 401 if user ID is not provided', async () => {
            const request = { user: {} } as unknown as FastifyRequest;

            await userController.getProfilePicture(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });


    });



    describe('updateUser', () => {
        it('should update a user and return 200 status', async () => {
            const request = {
                params: { id: '1' },
                body: { name: 'Updated Name', email: 'updated@example.com', password: 'newpassword', roleId: 2 }
            } as unknown as FastifyRequest;
            const mockUser = { id: 1, name: 'Updated Name' };
            (updateUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

            await userController.updateUser(request, mockReply);

            expect(updateUserUseCase.execute).toHaveBeenCalledWith(1, 'Updated Name', 'updated@example.com', 'newpassword', 2);
            expect(mockReply.code).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(mockUser);
        });

        it('should return 400 for invalid user ID format', async () => {
            const request = {
                params: { id: 'invalid' },
                body: { name: 'Updated Name', email: 'updated@example.com', password: 'newpassword', roleId: 2 }
            } as unknown as FastifyRequest;

            await userController.updateUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 404 if user is not found', async () => {
            const request = {
                params: { id: '1' },
                body: { name: 'Updated Name', email: 'updated@example.com', password: 'newpassword', roleId: 2 }
            } as unknown as FastifyRequest;
            (updateUserUseCase.execute as jest.Mock).mockResolvedValue(null);

            await userController.updateUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle and respond with status 500 on error', async () => {
            const request = {
                params: { id: '1' },
                body: { name: 'Updated Name', email: 'updated@example.com', password: 'newpassword', roleId: 2 }
            } as unknown as FastifyRequest;
            (updateUserUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await userController.updateUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user and return 204 status', async () => {
            const request = {
                params: { id: '1' }
            } as unknown as FastifyRequest;
            (deleteUserUseCase.execute as jest.Mock).mockResolvedValue(true);

            await userController.deleteUser(request, mockReply);

            expect(deleteUserUseCase.execute).toHaveBeenCalledWith(1);
            expect(mockReply.code).toHaveBeenCalledWith(204);
            expect(mockReply.send).toHaveBeenCalledWith(); // Adjust expectation to reflect call
        });

        it('should return 400 for invalid user ID format', async () => {
            const request = {
                params: { id: 'invalid' }
            } as unknown as FastifyRequest;

            await userController.deleteUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 404 if user is not found', async () => {
            const request = {
                params: { id: '1' }
            } as unknown as FastifyRequest;
            (deleteUserUseCase.execute as jest.Mock).mockResolvedValue(false);

            await userController.deleteUser(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle and respond with status 500 on error', async () => {
            const request = {
                params: { id: '1' }
            } as unknown as FastifyRequest;
            (deleteUserUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await userController.deleteUser(request, mockReply);

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
        it('should create an admin and return 201 status', async () => {
            const request = {
                body: { name: 'Admin', email: 'admin@example.com', password: 'password', roleId: 1 }
            } as unknown as FastifyRequest;
            const mockAdmin = { id: 1, name: 'Admin' };
            (createAdminUseCase.execute as jest.Mock).mockResolvedValue(mockAdmin);

            await userController.createAdmin(request, mockReply);

            expect(createAdminUseCase.execute).toHaveBeenCalledWith('Admin', 'admin@example.com', 'password', 1);
            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockAdmin);
        });

        it('should return 400 for email already exists error', async () => {
            const request = {
                body: { name: 'Admin', email: 'admin@example.com', password: 'password', roleId: 1 }
            } as unknown as FastifyRequest;
            (createAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error('Email already exists'));

            await userController.createAdmin(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Email already exists' });
        });

        it('should return 404 for missing password', async () => {
            const request = {
                body: { name: 'Admin', email: 'admin@example.com', password: '', roleId: 1 }
            } as unknown as FastifyRequest;
            (createAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error('Password is required'));

            await userController.createAdmin(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Password is required' });
        });

        it('should handle and respond with status 500 on error', async () => {
            const request = {
                body: { name: 'Admin', email: 'admin@example.com', password: 'password', roleId: 1 }
            } as unknown as FastifyRequest;
            (createAdminUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await userController.createAdmin(request, mockReply);

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
