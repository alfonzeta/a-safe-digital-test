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
exports.CreatePostUseCase = void 0;
const Post_1 = require("../../../domain/Post");
class CreatePostUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    execute(title, content, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!title.trim()) {
                throw new Error('Title cannot be empty');
            }
            if (content.trim().length < 10) {
                throw new Error('Content must be at least 10 characters long');
            }
            try {
                const newPost = new Post_1.Post(null, title, content, new Date(), userId);
                const createdPost = yield this.postRepository.create(newPost);
                return createdPost;
            }
            catch (error) {
                console.error('Error creating post:', error);
                throw new Error('Internal Server Error');
            }
        });
    }
}
exports.CreatePostUseCase = CreatePostUseCase;
