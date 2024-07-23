import { GetPostUseCase } from '../GetPostUseCase';
import { PostRepository } from '../../../../domain/PostRepository';
import { Post } from '../../../../domain/Post';

describe('GetPostUseCase', () => {
    let getPostUseCase: GetPostUseCase;
    let postRepository: PostRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        postRepository = {
            findById: jest.fn(),
        } as unknown as PostRepository;
        getPostUseCase = new GetPostUseCase(postRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should return a post if the post exists', async () => {
        const post = new Post(1, 'Title', 'Content', new Date(), 1);
        (postRepository.findById as jest.Mock).mockResolvedValue(post); // Simulate post found

        const result = await getPostUseCase.execute(1);

        expect(result).toEqual(post);
        expect(postRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return null if the post does not exist', async () => {
        (postRepository.findById as jest.Mock).mockResolvedValue(null); // Simulate no post found

        const result = await getPostUseCase.execute(1);

        expect(result).toBeNull();
        expect(postRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an error for invalid postId formats', async () => {
        const invalidPostIds: any[] = [
            'invalid',  // Non-numeric string
            -1,         // Negative number
            1.5         // Float number
        ];

        for (const invalidPostId of invalidPostIds) {
            await expect(getPostUseCase.execute(invalidPostId))
                .rejects
                .toThrow('Invalid post ID');

            expect(postRepository.findById).not.toHaveBeenCalled();
        }
    });

    it('should handle and log errors appropriately', async () => {
        const error = new Error('Database error');
        (postRepository.findById as jest.Mock).mockRejectedValue(error); // Simulate unexpected error

        await expect(getPostUseCase.execute(1))
            .rejects
            .toThrow('Internal Server Error'); // Ensure internal server error is thrown

        expect(console.error).toHaveBeenCalledWith('Error retrieving post:', error); // Check if error was logged
    });
});
