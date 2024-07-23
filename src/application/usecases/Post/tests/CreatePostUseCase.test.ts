import { CreatePostUseCase } from '../CreatePostUseCase';
import { PostRepository } from '../../../../domain/PostRepository';
import { Post } from '../../../../domain/Post';

describe('CreatePostUseCase', () => {
    let createPostUseCase: CreatePostUseCase;
    let postRepository: PostRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        postRepository = {
            create: jest.fn(),
        } as unknown as PostRepository;
        createPostUseCase = new CreatePostUseCase(postRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should create and return a post if all inputs are valid', async () => {
        const newPost = new Post(null, 'Title', 'Content with more than 10 characters', new Date(), 1);
        const createdPost = new Post(1, 'Title', 'Content with more than 10 characters', new Date(), 1);

        (postRepository.create as jest.Mock).mockResolvedValue(createdPost); // Simulate successful creation

        const result = await createPostUseCase.execute('Title', 'Content with more than 10 characters', 1);

        expect(result).toEqual(createdPost);
        expect(postRepository.create).toHaveBeenCalledWith(newPost);
    });

    it('should throw an error if the title is empty', async () => {
        await expect(createPostUseCase.execute('', 'Valid content with more than 10 characters', 1))
            .rejects
            .toThrow('Title cannot be empty');

        expect(postRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if the content is less than 10 characters', async () => {
        await expect(createPostUseCase.execute('Title', 'Short', 1))
            .rejects
            .toThrow('Content must be at least 10 characters long');

        expect(postRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if the userId is invalid', async () => {
        const invalidUserIds: any[] = ['invalid', -1, 1.5];

        for (const invalidUserId of invalidUserIds) {
            await expect(createPostUseCase.execute('Valid Title', 'Valid content with more than 10 characters', invalidUserId))
                .rejects
                .toThrow('Invalid user ID');

            expect(postRepository.create).not.toHaveBeenCalled();
        }
    });

    it('should handle and log errors appropriately', async () => {
        const error = new Error('Database error');
        (postRepository.create as jest.Mock).mockRejectedValue(error); // Simulate unexpected error

        await expect(createPostUseCase.execute('Title', 'Valid content with more than 10 characters', 1))
            .rejects
            .toThrow('Internal Server Error'); // Ensure internal server error is thrown

        expect(console.error).toHaveBeenCalledWith('Error creating post:', error); // Check if error was logged
    });
});
