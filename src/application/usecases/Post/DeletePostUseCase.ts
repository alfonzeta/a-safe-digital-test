import { PostRepository } from '../../../domain/PostRepository';

class DeletePostUseCase {
    constructor(private readonly postRepository: PostRepository) { }

    public async execute(postId: number): Promise<boolean | null> {
        if (typeof postId !== 'number' || postId <= 0 || !Number.isInteger(postId)) {
            console.error('Invalid ID format:', postId);
            return null;
        }
        try {
            await this.postRepository.delete(postId);
            return true;
        } catch (error) {
            if (error instanceof Error && error.message === 'Post not found') {
                console.error('Post not found error:', error);
                return false
            } else {
                console.error('Error deleting post:', error);
                throw new Error('Internal Server Error');
            }
        }
    }
}

export { DeletePostUseCase };
