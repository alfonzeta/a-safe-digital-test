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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
                const userName = (_b = request.user) === null || _b === void 0 ? void 0 : _b.name; // Assuming user ID is available in request.user
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
                const uploadDir = path_1.default.join(__dirname, '../../../src/uploads');
                // Create directory if it doesn't exist
                if (!fs_1.default.existsSync(uploadDir)) {
                    console.log(`Creating directory at ${uploadDir}`);
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const filePath = path_1.default.join(uploadDir, `user${userId}_name_${userName}_profile_picture${path_1.default.extname(filename)}`);
                console.log(`Saving file to ${filePath}`);
                const writeStream = fs_1.default.createWriteStream(filePath);
                file.pipe(writeStream);
                writeStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                    console.log('File write finished');
                    reply.send({ message: 'Profile picture uploaded successfully' });
                }));
                writeStream.on('error', (err) => {
                    console.error('Error writing file:', err);
                    reply.code(500).send({ error: 'Internal Server Error' });
                });
            }
            catch (error) {
                console.error('Error uploading profile picture:', error);
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
