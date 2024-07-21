import { Post } from '../../../domain/Post';
import { PostRepository } from '../../../domain/PostRepository';

class CreatePostUseCase {

    constructor(private readonly postRepository: PostRepository) { }

    public async execute(title: string, content: string, userId: number): Promise<Post | null> {

        if (!title.trim()) {
            throw new Error('Title cannot be empty');
        }
        if (content.trim().length < 10) {
            throw new Error('Content must be at least 10 characters long');
        }
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
