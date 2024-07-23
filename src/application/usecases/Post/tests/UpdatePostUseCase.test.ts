import { UpdatePostUseCase } from '../UpdatePostUseCase';
import { PostRepository } from '../../../../domain/PostRepository';
import { Post } from '../../../../domain/Post';

describe('UpdatePostUseCase', () => {
    let updatePostUseCase: UpdatePostUseCase;
    let postRepository: PostRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        postRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        } as unknown as PostRepository;
        updatePostUseCase = new UpdatePostUseCase(postRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should update and return the post if the post exists', async () => {
        const existingPost = new Post(1, 'Old Title', 'Old Content', new Date(), 1);
        const updatedPost = new Post(1, 'New Title', 'New Content', new Date(), 1);

        (postRepository.findById as jest.Mock).mockResolvedValue(existingPost); // Simulate post found
        (postRepository.update as jest.Mock).mockResolvedValue(updatedPost); // Simulate post update

        const result = await updatePostUseCase.execute(1, 'New Title', 'New Content');

        expect(result).toEqual(updatedPost);
        expect(postRepository.findById).toHaveBeenCalledWith(1);
        expect(postRepository.update).toHaveBeenCalledWith(expect.objectContaining({
            title: 'New Title',
            content: 'New Content',
        }));
    });

    it('should return null if the post does not exist', async () => {
        (postRepository.findById as jest.Mock).mockResolvedValue(null); // Simulate no post found

        const result = await updatePostUseCase.execute(1, 'New Title', 'New Content');

        expect(result).toBeNull();
        expect(postRepository.findById).toHaveBeenCalledWith(1);
        expect(postRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error and log it if there is an internal server error', async () => {
        const error = new Error('Database error');
        (postRepository.findById as jest.Mock).mockRejectedValue(error); // Simulate unexpected error

        await expect(updatePostUseCase.execute(1, 'New Title', 'New Content'))
            .rejects
            .toThrow('Internal Server Error'); // Ensure internal server error is thrown

        expect(console.error).toHaveBeenCalledWith('Error updating post:', error); // Check if error was logged
    });

    it('should return null and log an error for invalid postId formats', async () => {
        const invalidPostIds: any[] = [
            'invalid',  // Non-numeric string
            -1,         // Negative number
            1.5         // Float number
        ];

        for (const invalidPostId of invalidPostIds) {
            const result = await updatePostUseCase.execute(invalidPostId, 'New Title', 'New Content');

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith('Invalid ID format:', invalidPostId);
            expect(postRepository.findById).not.toHaveBeenCalled();
            expect(postRepository.update).not.toHaveBeenCalled();
        }
    });
});
