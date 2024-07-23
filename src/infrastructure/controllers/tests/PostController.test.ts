import { FastifyReply, FastifyRequest } from 'fastify';
import { PostController } from '../PostController';
import { CreatePostUseCase } from '../../../application/usecases/Post/CreatePostUseCase';
import { DeletePostUseCase } from '../../../application/usecases/Post/DeletePostUseCase';
import { GetPostUseCase } from '../../../application/usecases/Post/GetPostUseCase';
import { UpdatePostUseCase } from '../../../application/usecases/Post/UpdatePostUseCase';
import { Post } from '../../../domain/Post';

describe('PostController', () => {
    let postController: PostController;
    let createPostUseCase: CreatePostUseCase;
    let deletePostUseCase: DeletePostUseCase;
    let getPostUseCase: GetPostUseCase;
    let updatePostUseCase: UpdatePostUseCase;
    let mockReply: FastifyReply;

    beforeEach(() => {
        createPostUseCase = { execute: jest.fn() } as unknown as CreatePostUseCase;
        deletePostUseCase = { execute: jest.fn() } as unknown as DeletePostUseCase;
        getPostUseCase = { execute: jest.fn() } as unknown as GetPostUseCase;
        updatePostUseCase = { execute: jest.fn() } as unknown as UpdatePostUseCase;

        postController = new PostController(
            createPostUseCase,
            deletePostUseCase,
            getPostUseCase,
            updatePostUseCase
        );

        mockReply = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as FastifyReply;
    });

    describe('createPost', () => {
        it('should create a post and return it with status 201', async () => {
            const post = new Post(1, 'Title', 'Content', new Date(), 1);
            (createPostUseCase.execute as jest.Mock).mockResolvedValue(post);

            const request = { body: { title: 'Title', content: 'Content', userId: 1 } } as FastifyRequest;

            await postController.createPost(request, mockReply);

            expect(createPostUseCase.execute).toHaveBeenCalledWith('Title', 'Content', 1);
            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(post);
        });

        it('should handle and respond with status 500 on error', async () => {
            (createPostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            const request = { body: { title: 'Title', content: 'Content', userId: 1 } } as FastifyRequest;

            await postController.createPost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('deletePost', () => {
        it('should delete a post and return status 204', async () => {
            (deletePostUseCase.execute as jest.Mock).mockResolvedValue(undefined);

            const request = { params: { id: '1' } } as FastifyRequest;

            await postController.deletePost(request, mockReply);

            expect(deletePostUseCase.execute).toHaveBeenCalledWith(1);
            expect(mockReply.code).toHaveBeenCalledWith(204);
            expect(mockReply.send).toHaveBeenCalledWith(); // Expect send to be called with no arguments
        });

        it('should return 400 for invalid postId format', async () => {
            const request = { params: { id: 'invalid' } } as FastifyRequest;

            await postController.deletePost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 404 if post is not found', async () => {
            (deletePostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Post not found'));

            const request = { params: { id: '1' } } as FastifyRequest;

            await postController.deletePost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Post not found' });
        });

        it('should handle and respond with status 500 on error', async () => {
            (deletePostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            const request = { params: { id: '1' } } as FastifyRequest;

            await postController.deletePost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('getPost', () => {
        it('should return a post with status 200', async () => {
            const post = new Post(1, 'Title', 'Content', new Date(), 1);
            (getPostUseCase.execute as jest.Mock).mockResolvedValue(post);

            const request = { params: { id: '1' } } as FastifyRequest;

            await postController.getPost(request, mockReply);

            expect(getPostUseCase.execute).toHaveBeenCalledWith(1);
            expect(mockReply.send).toHaveBeenCalledWith({
                id: post.id,
                title: post.title,
                content: post.content,
                userId: post.userId,
                createdAt: post.createdAt
            });
        });

        it('should return 400 for invalid postId format', async () => {
            const request = { params: { id: 'invalid' } } as FastifyRequest;

            await postController.getPost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 404 if post is not found', async () => {
            (getPostUseCase.execute as jest.Mock).mockResolvedValue(null);

            const request = { params: { id: '1' } } as FastifyRequest;

            await postController.getPost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Post not found' });
        });

        it('should handle and respond with status 500 on error', async () => {
            (getPostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            const request = { params: { id: '1' } } as FastifyRequest;

            await postController.getPost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('updatePost', () => {
        it('should update and return the post with status 200', async () => {
            const post = new Post(1, 'Updated Title', 'Updated Content', new Date(), 1);
            (updatePostUseCase.execute as jest.Mock).mockResolvedValue(post);

            const request = { params: { id: '1' }, body: { title: 'Updated Title', content: 'Updated Content' } } as FastifyRequest;

            await postController.updatePost(request, mockReply);

            expect(updatePostUseCase.execute).toHaveBeenCalledWith(1, 'Updated Title', 'Updated Content');
            expect(mockReply.send).toHaveBeenCalledWith(post);
        });

        it('should return 400 for invalid postId format', async () => {
            const request = { params: { id: 'invalid' }, body: { title: 'Title', content: 'Content' } } as FastifyRequest;

            await postController.updatePost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
        });

        it('should return 404 if post is not found', async () => {
            (updatePostUseCase.execute as jest.Mock).mockResolvedValue(null);

            const request = { params: { id: '1' }, body: { title: 'Title', content: 'Content' } } as FastifyRequest;

            await postController.updatePost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Post not found' });
        });

        it('should handle and respond with status 500 on error', async () => {
            (updatePostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            const request = { params: { id: '1' }, body: { title: 'Title', content: 'Content' } } as FastifyRequest;

            await postController.updatePost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });
});
