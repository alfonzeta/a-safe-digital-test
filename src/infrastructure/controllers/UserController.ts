import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../domain/UserRepository';
import { User } from '../../domain/User';
import { JwtService } from '../../infrastructure/services/JwtService';
import { SignInUseCase } from '../../application/usecases/User/SignInUseCase';
import { SignUpUseCase } from '../../application/usecases/User/SignUpUseCase';
import { CreateAdminUseCase } from '../../application/usecases/User/CreateAdminUseCase';
import { UpdateUserUseCase } from '../../application/usecases/User/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../application/usecases/User/DeleteUserUseCase';
import { GetUserUseCase } from '../../application/usecases/User/GetUserUseCase';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

interface Params {
    id: string;
}

export class UserController {
    constructor(
        private readonly getUserUseCase: GetUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly signInUseCase: SignInUseCase,
        private readonly signUpUseCase: SignUpUseCase,
        private readonly createAdminUseCase: CreateAdminUseCase
    ) { }


    async uploadProfilePicture(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const userId = request.user?.id; // Assuming user ID is available in request.user
            const userName = request.user?.name; // Assuming user ID is available in request.user
            if (!userId) {
                reply.code(401).send({ error: 'Unauthorized' });
                return;
            }
            const data = await request.file(); // Fastify-multipart provides file handling via request.file()
            if (!data) {
                console.log('No file data found');
                reply.code(400).send({ error: 'No file uploaded' });
                return;
            }
            console.log("data: ", data);


            const { filename, file } = data;
            const uploadDir = path.join(__dirname, '../../../src/uploads');


            // Create directory if it doesn't exist
            if (!fs.existsSync(uploadDir)) {
                console.log(`Creating directory at ${uploadDir}`);
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, `user${userId}_name_${userName}_profile_picture${path.extname(filename)}`);
            console.log(`Saving file to ${filePath}`);
            const writeStream = fs.createWriteStream(filePath);
            file.pipe(writeStream);

            writeStream.on('finish', async () => {
                console.log('File write finished');
                reply.send({ message: 'Profile picture uploaded successfully' });
            });

            writeStream.on('error', (err) => {
                console.error('Error writing file:', err);
                reply.code(500).send({ error: 'Internal Server Error' });
            });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

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
            const { name, email, password, roleId } = request.body as { name: string; email: string; password: string; roleId: number };

            // Validation is handled by the schema, so no need to check for password here


            if (!email) {
                reply.code(400).send({ error: 'Email already exists' });
                return;
            }
            const createdUser = await this.signUpUseCase.execute(name, email, password, 2);

            reply.code(201).send(createdUser);
        } catch (error) {
            // Type guard to check if error is an instance of Error
            if (error instanceof Error) {
                if (error.message === 'Email already exists') {
                    reply.code(400).send({ error: 'Email already exists' });
                } else if (error.message === 'Password is required') {
                    reply.code(404).send({ error: 'Password is required' });
                } else {
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
            } else {
                // Handle unexpected error types
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        }
    }

    async createAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { name, email, password, roleId } = request.body as { name: string; email: string; password: string; roleId: number };

            // Validation is handled by the schema, so no need to check for password here


            if (!email) {
                reply.code(400).send({ error: 'Email already exists' });
                return;
            }
            const createdUser = await this.createAdminUseCase.execute(name, email, password, roleId);

            reply.code(201).send(createdUser);
        } catch (error) {
            // Type guard to check if error is an instance of Error
            if (error instanceof Error) {
                if (error.message === 'Email already exists') {
                    reply.code(400).send({ error: 'Email already exists' });
                } else if (error.message === 'Password is required') {
                    reply.code(404).send({ error: 'Password is required' });
                } else {
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
            } else {
                // Handle unexpected error types
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        }
    }

    async updateUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const userId = parseInt(params.id, 10);
            const { name, email, password, roleId } = request.body as { name: string; email: string; password: string; roleId: number };


            const updatedUser = await this.updateUserUseCase.execute(userId, name, email, password, roleId);

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

    async signIn(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { email, password } = request.body as { email: string; password: string };
            const user = await this.signInUseCase.execute(email, password);
            if (!user) {
                reply.code(401).send({ error: 'Invalid email or password' });
                return;
            }

            reply.send(user.token);


        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
}
