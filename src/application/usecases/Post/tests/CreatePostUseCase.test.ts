import { CreatePostUseCase } from '../CreatePostUseCase'; // Adjust the import path as needed
import { PostRepository } from '../../../../domain/PostRepository';
import { Post } from '../../../../domain/Post';

jest.mock('../../../../index', () => ({
    wsClients: [
        { send: jest.fn() },
        { send: jest.fn() }
    ]
}));


describe('CreatePostUseCase', () => {
    let postRepository: PostRepository;
    let createPostUseCase: CreatePostUseCase;

    beforeEach(() => {
        postRepository = {
            create: jest.fn()
        } as unknown as PostRepository;
        createPostUseCase = new CreatePostUseCase(postRepository);
    });

    it('should throw an error if the title is empty', async () => {
        await expect(createPostUseCase.execute('', 'Valid content', 1))
            .rejects
            .toThrow('Title cannot be empty');
    });

    it('should throw an error if the content is less than 10 characters', async () => {
        await expect(createPostUseCase.execute('Valid Title', 'Short', 1))
            .rejects
            .toThrow('Content must be at least 10 characters long');
    });

    it('should throw an error if the user ID is invalid', async () => {
        await expect(createPostUseCase.execute('Valid Title', 'Valid content', -1))
            .rejects
            .toThrow('Invalid user ID');

        await expect(createPostUseCase.execute('Valid Title', 'Valid content', 0))
            .rejects
            .toThrow('Invalid user ID');

        await expect(createPostUseCase.execute('Valid Title', 'Valid content', 1.5))
            .rejects
            .toThrow('Invalid user ID');
    });

    it('should create a post and notify WebSocket clients', async () => {
        const newPost = new Post(null, 'Valid Title', 'Valid content', new Date(), 1);
        (postRepository.create as jest.Mock).mockResolvedValue(newPost);
        const result = await createPostUseCase.execute('Valid Title', 'Valid content', 1);

        expect(result).toEqual(newPost);
        expect(postRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Valid Title',
            content: 'Valid content',
            userId: 1
        }));

        const { wsClients } = require('../../../../index');
        for (const client of wsClients) {
            expect(client.send).toHaveBeenCalledWith('User 1 has created new post: "Valid Title"');
        }
    });

    it('should handle errors during post creation', async () => {
        (postRepository.create as jest.Mock).mockRejectedValue(new Error('DB error'));

        await expect(createPostUseCase.execute('Valid Title', 'Valid content', 1))
            .rejects
            .toThrow('Internal Server Error');
    });
});
