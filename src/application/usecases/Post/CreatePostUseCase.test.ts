import { CreatePostUseCase } from './CreatePostUseCase';
import { PostRepository } from '../../../domain/PostRepository';
import { Post } from '../../../domain/Post';

describe('CreatePostUseCase', () => {
    let createPostUseCase: CreatePostUseCase;
    let postRepository: PostRepository;

    beforeEach(() => {
        postRepository = {
            create: jest.fn(),
        } as unknown as PostRepository;
        createPostUseCase = new CreatePostUseCase(postRepository);
    });

    it('should create a new post successfully', async () => {
        const post = new Post(null, 'Title', 'Content with more than 10 characters', new Date(), 1);
        (postRepository.create as jest.Mock).mockResolvedValue(post);

        const result = await createPostUseCase.execute('Title', 'Content with more than 10 characters', 1);
        expect(result).toEqual(post);
        expect(postRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Title',
            content: 'Content with more than 10 characters',
            userId: 1,
        }));
    });

    it('should throw an error if title is empty', async () => {
        await expect(createPostUseCase.execute('', 'Valid content', 1))
            .rejects
            .toThrow('Title cannot be empty');
    });

    it('should throw an error if content is empty', async () => {
        await expect(createPostUseCase.execute('Valid title', '', 1))
            .rejects
            .toThrow('Content must be at least 10 characters long');
    });

    it('should throw an error if content is less than 10 characters', async () => {
        await expect(createPostUseCase.execute('Valid title', 'Short', 1))
            .rejects
            .toThrow('Content must be at least 10 characters long');
    });


});
