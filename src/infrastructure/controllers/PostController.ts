import { FastifyReply, FastifyRequest } from 'fastify';
import { CreatePostUseCase } from '../../application/usecases/Post/CreatePostUseCase';
import { DeletePostUseCase } from '../../application/usecases/Post/DeletePostUseCase';
import { GetPostUseCase } from '../../application/usecases/Post/GetPostUseCase';
import { UpdatePostUseCase } from '../../application/usecases/Post/UpdatePostUseCase';

export class PostController {
    constructor(
        private readonly createPostUseCase: CreatePostUseCase,
        private readonly deletePostUseCase: DeletePostUseCase,
        private readonly getPostUseCase: GetPostUseCase,
        private readonly updatePostUseCase: UpdatePostUseCase
    ) { }

    async createPost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { title, content, userId } = request.body as { title: string; content: string; userId: number };

            const createdPost = await this.createPostUseCase.execute(title, content, userId);
            reply.code(201).send(createdPost);
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async deletePost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const postId = parseInt(params.id, 10);
            await this.deletePostUseCase.execute(postId);
            reply.code(204).send();
        } catch (error) {
            if (error instanceof Error && error.message === 'Post not found') {
                reply.code(404).send({ error: 'Post not found' });
            } else {
                reply.code(500).send({ error: 'Internal Server Error' });
            }
        }
    }

    async getPost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const postId = parseInt(params.id, 10);
            const post = await this.getPostUseCase.execute(postId);
            if (!post) {
                reply.code(404).send({ error: 'Post not found' });
                return;
            }
            reply.send({
                id: post.id,
                title: post.title,
                content: post.content,
                userId: post.userId
            });
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async updatePost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const postId = parseInt(params.id, 10);
            const { title, content } = request.body as { title: string; content: string };
            const updatedPost = await this.updatePostUseCase.execute(postId, title, content);
            if (!updatedPost) {
                reply.code(404).send({ error: 'Post not found' });
                return;
            }
            reply.send(updatedPost);
        } catch (error) {
            console.error('Error updating post:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
}
