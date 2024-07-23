import { Post } from '../../../domain/Post';
import { PostRepository } from '../../../domain/PostRepository';

class GetPostUseCase {
    constructor(private readonly postRepository: PostRepository) { }

    public async execute(postId: number): Promise<Post | null> {
        if (typeof postId !== 'number' || postId <= 0 || !Number.isInteger(postId)) {
            throw new Error('Invalid post ID');
        }

        try {
            return await this.postRepository.findById(postId);
        } catch (error) {
            console.error('Error retrieving post:', error);
            throw new Error('Internal Server Error');
        }
    }
}

export { GetPostUseCase };
