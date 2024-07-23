import { DeletePostUseCase } from '../DeletePostUseCase';
import { PostRepository } from '../../../../domain/PostRepository';

describe('DeletePostUseCase', () => {
    let deletePostUseCase: DeletePostUseCase;
    let postRepository: PostRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        postRepository = {
            delete: jest.fn(),
        } as unknown as PostRepository;
        deletePostUseCase = new DeletePostUseCase(postRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should successfully delete a post', async () => {
        // Mock the repository method to resolve successfully
        (postRepository.delete as jest.Mock).mockResolvedValue(undefined);

        await expect(deletePostUseCase.execute(1)).resolves.toBeUndefined();
        expect(postRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw "Post not found" error if the post does not exist', async () => {
        // Simulate post not found error
        const error = new Error('Post not found');
        (postRepository.delete as jest.Mock).mockRejectedValue(error);

        await expect(deletePostUseCase.execute(1))
            .rejects
            .toThrow('Post not found');
        expect(postRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle and log unexpected errors', async () => {
        const error = new Error('Unexpected error');
        (postRepository.delete as jest.Mock).mockRejectedValue(error);

        await expect(deletePostUseCase.execute(1))
            .rejects
            .toThrow('Internal Server Error');
        expect(console.error).toHaveBeenCalledWith('Error deleting post:', error);
    });

    it('should handle invalid post ID', async () => {
        const invalidIds = [-1, NaN, 'string' as unknown as number, 1.23];
        for (const invalidId of invalidIds) {
            await expect(deletePostUseCase.execute(invalidId as number))
                .rejects
                .toThrow('Internal Server Error'); // Assuming your method should handle this as an internal error
        }
    });
});
