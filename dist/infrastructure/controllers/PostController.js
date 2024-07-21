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
exports.PostController = void 0;
class PostController {
    constructor(createPostUseCase, deletePostUseCase, getPostUseCase, updatePostUseCase) {
        this.createPostUseCase = createPostUseCase;
        this.deletePostUseCase = deletePostUseCase;
        this.getPostUseCase = getPostUseCase;
        this.updatePostUseCase = updatePostUseCase;
    }
    createPost(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, content, userId } = request.body;
                const createdPost = yield this.createPostUseCase.execute(title, content, userId);
                reply.code(201).send(createdPost);
            }
            catch (error) {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        });
    }
    deletePost(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = request.params;
                const postId = parseInt(params.id, 10);
                yield this.deletePostUseCase.execute(postId);
                reply.code(204).send();
            }
            catch (error) {
                if (error instanceof Error && error.message === 'Post not found') {
                    reply.code(404).send({ error: 'Post not found' });
                }
                else {
                    reply.code(500).send({ error: 'Internal Server Error' });
                }
            }
        });
    }
    getPost(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = request.params;
                const postId = parseInt(params.id, 10);
                const post = yield this.getPostUseCase.execute(postId);
                if (!post) {
                    reply.code(404).send({ error: 'Post not found' });
                    return;
                }
                reply.send({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    userId: post.userId
                });
            }
            catch (error) {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        });
    }
    updatePost(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = request.params;
                const postId = parseInt(params.id, 10);
                const { title, content } = request.body;
                const updatedPost = yield this.updatePostUseCase.execute(postId, title, content);
                if (!updatedPost) {
                    reply.code(404).send({ error: 'Post not found' });
                    return;
                }
                reply.send(updatedPost);
            }
            catch (error) {
                console.error('Error updating post:', error);
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        });
    }
}
exports.PostController = PostController;
