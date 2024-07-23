import { PostRepository } from '../../../domain/PostRepository';

class DeletePostUseCase {
    constructor(private readonly postRepository: PostRepository) { }

    public async execute(postId: number): Promise<void> {
        if (typeof postId !== 'number' || postId <= 0 || !Number.isInteger(postId)) {
            throw new Error('Invalid post ID');
        }
        try {
            await this.postRepository.delete(postId);
        } catch (error) {
            if (error instanceof Error && error.message === 'Post not found') {
                throw new Error('Post not found');
            } else {
                console.error('Error deleting post:', error);
                throw new Error('Internal Server Error');
            }
        }
    }
}

export { DeletePostUseCase };
