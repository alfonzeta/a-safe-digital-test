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


    it('should return false if the post does not exist', async () => {
        (postRepository.delete as jest.Mock).mockRejectedValue(new Error('Post not found')); // Simulate post not found error

        const result = await deletePostUseCase.execute(1);
        expect(result).toBe(false);
        expect(postRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle invalid post ID', async () => {
        const invalidIds: any[] = [
            'invalid',  // Non-numeric string
            -1,         // Negative number
            1.5         // Float number
        ];

        for (const invalidId of invalidIds) {
            // Call the execute method with the invalidId and await its result
            const result = await deletePostUseCase.execute(invalidId);

            // Assert that the result should be null
            expect(result).toBeNull();

            // Assert that console.error was called with the correct message
            expect(console.error).toHaveBeenCalledWith('Invalid ID format:', invalidId);

            // Assert that postRepository.delete was not called
            expect(postRepository.delete).not.toHaveBeenCalled();
        }
    });

    it('should return true if post is succesfully deleted', async () => {
        (postRepository.delete as jest.Mock).mockResolvedValue(undefined); // Simulate successful deletion

        const result = await deletePostUseCase.execute(1);
        expect(result).toBe(true);
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


});
