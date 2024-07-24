import { Post } from '../../../domain/Post';
import { PostRepository } from '../../../domain/PostRepository';
import { wsClients } from '../../../index'; // Adjust the import path as needed

class CreatePostUseCase {

    constructor(private readonly postRepository: PostRepository) { }

    public async execute(title: string, content: string, userId: number): Promise<Post | null> {
        if (!title.trim()) {
            throw new Error('Title cannot be empty');
        }
        if (content.trim().length < 10) {
            throw new Error('Content must be at least 10 characters long');
        }
        if (typeof userId !== 'number' || userId <= 0 || !Number.isInteger(userId)) {
            throw new Error('Invalid user ID');
        }

        try {
            const newPost = new Post(null, title, content, new Date(), userId);
            const createdPost = await this.postRepository.create(newPost);

            // Notify WebSocket clients
            const message = `User ${userId} has created new post: "${title}"`;
            for (const client of wsClients) {
                client.send(message);
            }


            return createdPost;
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error('Internal Server Error');
        }
    }
}

export { CreatePostUseCase };
