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
exports.PrismaPostRepository = void 0;
const client_1 = require("@prisma/client");
const Post_1 = require("../../domain/Post");
class PrismaPostRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(post) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createdPost = yield this.prisma.post.create({
                    data: {
                        title: post.title,
                        content: post.content,
                        userId: post.userId,
                        createdAt: new Date(),
                    },
                });
                return new Post_1.Post(createdPost.id, createdPost.title, createdPost.content, createdPost.createdAt, createdPost.userId);
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new Error('Post already exists with the same unique identifier');
                    }
                }
                throw error;
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield this.prisma.post.findUnique({
                    where: { id },
                });
                if (!post)
                    return null;
                return new Post_1.Post(post.id, post.title, post.content, post.createdAt, post.userId);
            }
            catch (error) {
                throw error;
            }
        });
    }
    update(post) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedPost = yield this.prisma.post.update({
                    where: { id: post.id },
                    data: {
                        title: post.title,
                        content: post.content,
                    },
                });
                return new Post_1.Post(updatedPost.id, updatedPost.title, updatedPost.content, updatedPost.createdAt, updatedPost.userId);
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new Error('Post already exists with the same unique identifier');
                    }
                    if (error.code === 'P2025') {
                        throw new Error('Post not found');
                    }
                }
                throw error;
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.post.delete({
                    where: { id },
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2025') {
                        throw new Error('Post not found');
                    }
                }
                throw error;
            }
        });
    }
}
exports.PrismaPostRepository = PrismaPostRepository;
