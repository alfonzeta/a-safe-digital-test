import { Post } from '../../../domain/Post';
import { PostRepository } from '../../../domain/PostRepository';

class UpdatePostUseCase {
    constructor(private readonly postRepository: PostRepository) { }

    public async execute(postId: number, title: string, content: string): Promise<Post | null> {
        if (typeof postId !== 'number' || postId <= 0 || !Number.isInteger(postId)) {
            console.error('Invalid ID format:', postId);
            return null;
        }

        try {
            const existingPost = await this.postRepository.findById(postId);

            if (!existingPost) {
                return null;
            }

            existingPost.title = title;
            existingPost.content = content;

            const updatedPost = await this.postRepository.update(existingPost);
            return updatedPost;
        } catch (error) {
            console.error('Error updating post:', error);
            throw new Error('Internal Server Error');
        }
    }
}

export { UpdatePostUseCase };
