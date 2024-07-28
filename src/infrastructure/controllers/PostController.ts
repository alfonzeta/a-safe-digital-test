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

    async updatePost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const idPattern = /^[0-9]+$/;
            if (!idPattern.test(params.id)) {
                return reply.code(400).send({ error: 'Invalid user ID format' });

            }
            const postIdToUpdate = parseInt(params.id, 10);
            const postToUpdate = await this.getPostUseCase.execute(postIdToUpdate);
            const authenticatedUser = request.user;

            if (!postToUpdate) {
                return reply.code(404).send({ error: 'Post not found' });
            }

            if (!authenticatedUser) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            if (authenticatedUser.roleId !== 1 && parseInt(authenticatedUser.id) !== postToUpdate.userId) {
                return reply.code(403).send({ error: 'Forbidden' });
            }


            const { title, content } = request.body as { title: string; content: string };
            const updatedPost = await this.updatePostUseCase.execute(postIdToUpdate, title, content);
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

    async createPost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { title, content, userId } = request.body as { title: string; content: string; userId: number };

            const authenticatedUser = request.user;

            if (!authenticatedUser) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            const createdPost = await this.createPostUseCase.execute(title, content, parseInt(authenticatedUser.id));
            reply.code(201).send(createdPost);
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

    async deletePost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const idPattern = /^[0-9]+$/;
            if (!idPattern.test(params.id)) {
                return reply.code(400).send({ error: 'Invalid user ID format' });
            }

            const postIdToDelete = parseInt(params.id, 10);
            const authenticatedUser = request.user;
            const postToDelete = await this.getPostUseCase.execute(postIdToDelete);

            if (!postToDelete) {
                return reply.code(404).send({ error: 'Post not found' });
            }

            if (!authenticatedUser) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            if (authenticatedUser.roleId !== 1 && parseInt(authenticatedUser.id) !== postToDelete.userId) {
                return reply.code(403).send({ error: 'Forbidden' });
            }

            const deleted = await this.deletePostUseCase.execute(postIdToDelete);
            if (deleted) {

                reply.code(204);
            } else {
                return reply.code(404).send({ error: 'Post not found' });
            }
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }



    async getPost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const params = request.params as { id: string };
            const idPattern = /^[0-9]+$/;
            if (!idPattern.test(params.id)) {
                return reply.code(400).send({ error: 'Invalid user ID format' });

            }
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
                userId: post.userId,
                createdAt: post.createdAt
            });
        } catch (error) {
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }

}
