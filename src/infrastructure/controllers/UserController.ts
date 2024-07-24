import { FastifyReply, FastifyRequest } from 'fastify';
import { SignInUseCase } from '../../application/usecases/User/SignInUseCase';
import { SignUpUseCase } from '../../application/usecases/User/SignUpUseCase';
import { CreateAdminUseCase } from '../../application/usecases/User/CreateAdminUseCase';
import { UpdateUserUseCase } from '../../application/usecases/User/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../application/usecases/User/DeleteUserUseCase';
import { GetUserUseCase } from '../../application/usecases/User/GetUserUseCase';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.OVH_ACCESS_KEY,
    secretAccessKey: process.env.OVH_SECRET_KEY,
    region: 'UK' // Or your OVH region
});

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('https://s3.uk.io.cloud.ovh.net/'), // OVH S3 endpoint
    s3ForcePathStyle: true, // Needed for OVH
});

const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];


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

            // Check file size
            // Check if the file was truncated
            if (data.file.truncated) {
                console.log(data.file.truncated);

                reply.code(413).send({ error: 'File size exceeds the 500 KB limit' });
                return;
            }

            if (!validImageTypes.includes(data.mimetype)) {
                reply.code(415).send({ error: 'Unsupported Media Type' });
                return;
            }



            const { filename, file } = data;
            const filePath = `user${userId}`;

            const bucketName = process.env.OVH_BUCKET_NAME;
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
            reply.code(200).send({ message: 'Profile picture uploaded successfully', location: uploadResult.Location });

        } catch (error) {
            console.error('Error uploading profile picture:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async updateUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const idPattern = /^[0-9]+$/;
            if (!idPattern.test(params.id)) {
                return reply.code(400).send({ error: 'Invalid user ID format' });
            }
            const userIdToUpdate = parseInt(params.id, 10);
            const { name, email, password, roleId } = request.body as { name: string; email: string; password: string; roleId: number };

            const authenticatedUser = request.user;

            if (!authenticatedUser) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            if (authenticatedUser.roleId !== 1 && parseInt(authenticatedUser.id) !== userIdToUpdate) {
                return reply.code(403).send({ error: 'Forbidden' });
            }

            if (roleId && authenticatedUser.roleId !== 1 && roleId !== authenticatedUser.roleId) {
                return reply.code(403).send({ error: 'Forbidden' })
            }

            const updatedUser = await this.updateUserUseCase.execute(userIdToUpdate, name, email, password, roleId);

            if (!updatedUser) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }
            reply.code(200).send(updatedUser); // Ensure code(200) is called here
        } catch (error) {
            if (error instanceof Error && error.message === 'Email already exists') {
                reply.code(400).send({ error: 'Email already exists' });
            } else {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        }
    }
    async createAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { name, email, password, roleId } = request.body as { name: string; email: string; password: string; roleId: number };

            // Validation is handled by the schema, so no need to check for password here
            const authenticatedUser = request.user;


            if (!authenticatedUser) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            if (authenticatedUser.roleId !== 1) {
                return reply.code(403).send({ error: 'Forbidden' });
            }

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

            // Stream the file data to the client
            if (data.Body instanceof Buffer) {
                reply.code(200).send(data.Body);
            } else {
                reply.send(data.Body);
            }
        } catch (error) {
            console.error('Error getting profile picture:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async deleteUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as Params;
            const idPattern = /^[0-9]+$/;
            if (!idPattern.test(params.id)) {
                return reply.code(400).send({ error: 'Invalid user ID format' });
            }


            const userIdToDelete = parseInt(params.id, 10);
            const authenticatedUser = request.user;


            if (!authenticatedUser) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            if (authenticatedUser.roleId !== 1 && parseInt(authenticatedUser.id) !== userIdToDelete) {
                return reply.code(403).send({ error: 'Forbidden' });
            }

            const success = await this.deleteUserUseCase.execute(userIdToDelete);
            if (!success) {
                return reply.code(404).send({ error: 'User not found' });
            }

            reply.code(204); // 204 should not include a body
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async getUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as Params;
            const idPattern = /^[0-9]+$/;
            if (!idPattern.test(params.id)) {
                reply.code(400).send({ error: 'Invalid user ID format' });
                return;
            }
            const userId = parseInt(params.id, 10);
            const user = await this.getUserUseCase.execute(userId);
            if (!user) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }
            reply.code(200).send(user); // Ensure code(200) is called here
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async createUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { name, email, password, roleId } = request.body as { name: string; email: string; password: string; roleId: number };

            // Validation is handled by the schema, so no need to check for password here

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
