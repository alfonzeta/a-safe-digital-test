import { Post } from '../../../domain/Post';
import { PostRepository } from '../../../domain/PostRepository';

class CreatePostUseCase {

    constructor(private readonly postRepository: PostRepository) {}

    public async execute(title: string, content: string, userId: number): Promise<Post | null> {
        try {
            const newPost = new Post(null, title, content, new Date(), userId);
            const createdPost = await this.postRepository.create(newPost);
            return createdPost;
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error('Internal Server Error');
        }
    }
}

export { CreatePostUseCase };
