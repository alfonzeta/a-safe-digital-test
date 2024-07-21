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
const CreatePostUseCase_1 = require("./CreatePostUseCase");
const Post_1 = require("../../../domain/Post");
describe('CreatePostUseCase', () => {
    let createPostUseCase;
    let postRepository;
    beforeEach(() => {
        postRepository = {
            create: jest.fn(),
        };
        createPostUseCase = new CreatePostUseCase_1.CreatePostUseCase(postRepository);
    });
    it('should create a new post successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const post = new Post_1.Post(null, 'Title', 'Content with more than 10 characters', new Date(), 1);
        postRepository.create.mockResolvedValue(post);
        const result = yield createPostUseCase.execute('Title', 'Content with more than 10 characters', 1);
        expect(result).toEqual(post);
        expect(postRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Title',
            content: 'Content with more than 10 characters',
            userId: 1,
        }));
    }));
    it('should throw an error if title is empty', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(createPostUseCase.execute('', 'Valid content', 1))
            .rejects
            .toThrow('Title cannot be empty');
    }));
    it('should throw an error if content is empty', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(createPostUseCase.execute('Valid title', '', 1))
            .rejects
            .toThrow('Content must be at least 10 characters long');
    }));
    it('should throw an error if content is less than 10 characters', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(createPostUseCase.execute('Valid title', 'Short', 1))
            .rejects
            .toThrow('Content must be at least 10 characters long');
    }));
});
