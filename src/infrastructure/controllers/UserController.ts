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
import { S3 } from 'aws-sdk';
// src/config/ovh-config.ts
import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: "c022c8562fc14124a9f9f1c48ecc98af",
    secretAccessKey: "3ce048e2370e4d71a1a1a1d74568b451",
    region: 'UK' // Or your OVH region
});

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('https://s3.uk.io.cloud.ovh.net/'), // OVH S3 endpoint
    s3ForcePathStyle: true, // Needed for OVH
});



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
            const userName = request.user?.name; // Assuming user name is available in request.user

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
            const filePath = `user${userId}`;

            const bucketName = "mystorage0temp";
            if (!bucketName) {
                console.error('OVH_BUCKET_NAME is not defined');
                reply.code(500).send({ error: 'Internal Server Error' });
                return;
            }

            const params: AWS.S3.PutObjectRequest = {
                Bucket: bucketName,
                Key: filePath,
                Body: file,
                ContentType: data.mimetype,
            };

            // Use a promise to handle the S3 upload call
            const uploadResult = await new Promise<AWS.S3.ManagedUpload.SendData>((resolve, reject) => {
                s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });

            console.log('File uploaded successfully', uploadResult);
            reply.send({ message: 'Profile picture uploaded successfully', location: uploadResult.Location });

        } catch (error) {
            console.error('Error uploading profile picture:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async getProfilePicture(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const userId = request.user?.id;
            if (!userId) {
                reply.code(401).send({ error: 'Unauthorized' });
                return;
            }

            const fileName = `user${userId}`; // File name should include extension if applicable

            const bucketName = "mystorage0temp";
            if (!bucketName) {
                console.error('OVH_BUCKET_NAME is not defined');
                reply.code(500).send({ error: 'Internal Server Error' });
                return;
            }

            const params: AWS.S3.GetObjectRequest = {
                Bucket: bucketName,
                Key: fileName,
            };

            // Use a promise to handle the S3 getObject call
            const data = await new Promise<AWS.S3.GetObjectOutput>((resolve, reject) => {
                s3.getObject(params, (err: AWS.AWSError, data: AWS.S3.GetObjectOutput) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });

            // Set the appropriate Content-Type header based on the file's content type
            const contentType = data.ContentType || 'application/octet-stream';
            reply.header('Content-Type', contentType);

            // Stream the file data to the client
            if (data.Body instanceof Buffer) {
                reply.send(data.Body);
            } else {
                reply.send(data.Body);
            }
        } catch (error) {
            console.error('Error getting profile picture:', error);
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
