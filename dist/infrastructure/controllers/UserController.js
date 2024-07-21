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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
// src/config/ovh-config.ts
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.update({
    accessKeyId: "c022c8562fc14124a9f9f1c48ecc98af",
    secretAccessKey: "3ce048e2370e4d71a1a1a1d74568b451",
    region: 'UK' // Or your OVH region
});
const s3 = new aws_sdk_1.default.S3({
    endpoint: new aws_sdk_1.default.Endpoint('https://s3.uk.io.cloud.ovh.net/'), // OVH S3 endpoint
    s3ForcePathStyle: true, // Needed for OVH
});
class UserController {
    constructor(getUserUseCase, updateUserUseCase, deleteUserUseCase, signInUseCase, signUpUseCase, createAdminUseCase) {
        this.getUserUseCase = getUserUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
        this.signInUseCase = signInUseCase;
        this.signUpUseCase = signUpUseCase;
        this.createAdminUseCase = createAdminUseCase;
    }
    uploadProfilePicture(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming user ID is available in request.user
                const userName = (_b = request.user) === null || _b === void 0 ? void 0 : _b.name; // Assuming user name is available in request.user
                if (!userId) {
                    reply.code(401).send({ error: 'Unauthorized' });
                    return;
                }
                const data = yield request.file(); // Fastify-multipart provides file handling via request.file()
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
                const params = {
                    Bucket: bucketName,
                    Key: filePath,
                    Body: file,
                    ContentType: data.mimetype,
                };
                // Use a promise to handle the S3 upload call
                const uploadResult = yield new Promise((resolve, reject) => {
                    s3.upload(params, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(data);
                        }
                    });
                });
                console.log('File uploaded successfully', uploadResult);
                reply.send({ message: 'Profile picture uploaded successfully', location: uploadResult.Location });
            }
            catch (error) {
                console.error('Error uploading profile picture:', error);
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        });
    }
    getProfilePicture(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
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
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                };
                // Use a promise to handle the S3 getObject call
                const data = yield new Promise((resolve, reject) => {
                    s3.getObject(params, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
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
                }
                else {
                    reply.send(data.Body);
                }
            }
            catch (error) {
                console.error('Error getting profile picture:', error);
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        });
    }
    getUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = request.params;
                const userId = parseInt(params.id, 10);
                const user = yield this.getUserUseCase.execute(userId);
                if (!user) {
                    reply.code(404).send({ error: 'User not found' });
                    return;
                }
                reply.send(user);
            }
            catch (error) {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        });
    }
    createUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, roleId } = request.body;
                // Validation is handled by the schema, so no need to check for password here
                if (!email) {
                    reply.code(400).send({ error: 'Email already exists' });
                    return;
                }
                const createdUser = yield this.signUpUseCase.execute(name, email, password, 2);
                reply.code(201).send(createdUser);
            }
            catch (error) {
                // Type guard to check if error is an instance of Error
                if (error instanceof Error) {
                    if (error.message === 'Email already exists') {
                        reply.code(400).send({ error: 'Email already exists' });
                    }
                    else if (error.message === 'Password is required') {
                        reply.code(404).send({ error: 'Password is required' });
                    }
                    else {
                        reply.code(500).send({ error: 'Internal Server Error' });
                    }
                }
                else {
                    // Handle unexpected error types
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
            }
        });
    }
    createAdmin(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, roleId } = request.body;
                // Validation is handled by the schema, so no need to check for password here
                if (!email) {
                    reply.code(400).send({ error: 'Email already exists' });
                    return;
                }
                const createdUser = yield this.createAdminUseCase.execute(name, email, password, roleId);
                reply.code(201).send(createdUser);
            }
            catch (error) {
                // Type guard to check if error is an instance of Error
                if (error instanceof Error) {
                    if (error.message === 'Email already exists') {
                        reply.code(400).send({ error: 'Email already exists' });
                    }
                    else if (error.message === 'Password is required') {
                        reply.code(404).send({ error: 'Password is required' });
                    }
                    else {
                        reply.code(500).send({ error: 'Internal Server Error' });
                    }
                }
                else {
                    // Handle unexpected error types
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
            }
        });
    }
    updateUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = request.params;
                const userId = parseInt(params.id, 10);
                const { name, email, password, roleId } = request.body;
                const updatedUser = yield this.updateUserUseCase.execute(userId, name, email, password, roleId);
                if (!updatedUser) {
                    reply.code(404).send({ error: 'User not found' });
                    return;
                }
                reply.send(updatedUser);
            }
            catch (error) {
                if (error instanceof Error && error.message === 'Email already exists') {
                    reply.code(400).send({ error: 'Email already exists' });
                }
                else {
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
            }
        });
    }
    deleteUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = request.params;
                const userId = parseInt(params.id, 10);
                const success = yield this.deleteUserUseCase.execute(userId);
                if (!success) {
                    reply.code(404).send({ error: 'User not found' });
                    return;
                }
                reply.code(204).send();
            }
            catch (error) {
                if (error instanceof Error && error.message === 'Internal Server Error') {
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
                else {
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
            }
        });
    }
    signIn(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = request.body;
                const user = yield this.signInUseCase.execute(email, password);
                if (!user) {
                    reply.code(401).send({ error: 'Invalid email or password' });
                    return;
                }
                reply.send(user.token);
            }
            catch (error) {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        });
    }
}
exports.UserController = UserController;
