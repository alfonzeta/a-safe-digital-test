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
exports.DeletePostUseCase = void 0;
class DeletePostUseCase {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    execute(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.postRepository.delete(postId);
            }
            catch (error) {
                if (error instanceof Error && error.message === 'Post not found') {
                    throw new Error('Post not found');
                }
                else {
                    console.error('Error deleting post:', error);
                    throw new Error('Internal Server Error');
                }
            }
        });
    }
}
exports.DeletePostUseCase = DeletePostUseCase;
