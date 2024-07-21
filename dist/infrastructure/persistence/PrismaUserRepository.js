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
exports.PrismaUserRepository = void 0;
const client_1 = require("@prisma/client");
const User_1 = require("../../domain/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
class PrismaUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield bcrypt_1.default.hash(user.password, SALT_ROUNDS);
                const createdUser = yield this.prisma.user.create({
                    data: {
                        name: user.name,
                        email: user.email,
                        password: hashedPassword,
                        roleId: user.roleId
                    },
                });
                return new User_1.User(createdUser.id, createdUser.name, createdUser.email, createdUser.password, createdUser.roleId);
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    throw new Error('Email already exists2');
                }
                throw error;
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { id },
            });
            if (!user)
                return null;
            if (user.roleId === null) {
                throw new Error('Role ID should not be null');
            }
            return new User_1.User(user.id, user.name, user.email, user.password, user.roleId);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { email },
            });
            if (!user)
                return null;
            if (user.roleId === null) {
                throw new Error('Role ID should not be null');
            }
            return new User_1.User(user.id, user.name, user.email, user.password, user.roleId);
        });
    }
    update(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateData = {
                    name: user.name,
                    email: user.email,
                    roleId: user.roleId
                };
                if (user.password) {
                    updateData.password = yield bcrypt_1.default.hash(user.password, SALT_ROUNDS);
                }
                const updatedUser = yield this.prisma.user.update({
                    where: { id: user.id },
                    data: updateData,
                });
                return new User_1.User(updatedUser.id, updatedUser.name, updatedUser.email, updatedUser.password, updatedUser.roleId);
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    throw new Error('Email already exists');
                }
                throw error;
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.user.delete({
                    where: { id },
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2025') {
                        // Record not found
                        throw new Error('User not found');
                    }
                }
                throw error;
            }
        });
    }
    validatePassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findByEmail(email);
            if (!user || !user.password)
                return false;
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            return isMatch;
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
