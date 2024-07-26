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
    let mockRequest: FastifyRequest;

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
        mockRequest = {
            params: { id: '1' },
            body: { title: 'Updated Title', content: 'Updated Content' },
            user: { id: '1', roleId: 1 }
        } as unknown as FastifyRequest;
    });

    describe('updatePost', () => {
        it('should successfully update the post and return it', async () => {
            const postToReturn = { id: 1, title: 'Updated Title', content: 'Updated Content' };
            (getPostUseCase.execute as jest.Mock).mockResolvedValue({ userId: 1 });
            (updatePostUseCase.execute as jest.Mock).mockResolvedValue(postToReturn);

            await postController.updatePost(mockRequest, mockReply);

            expect(mockReply.code).not.toHaveBeenCalledWith(400);
            expect(mockReply.code).not.toHaveBeenCalledWith(401);
            expect(mockReply.code).not.toHaveBeenCalledWith(403);
            expect(mockReply.code).not.toHaveBeenCalledWith(404);
            expect(mockReply.code).not.toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith(postToReturn);
        });


        it('should return 500 if there is an internal server error', async () => {
            (getPostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await postController.updatePost(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
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

    });

    describe('createPost', () => {
        it('should create a post and return it with status 201', async () => {
            const post = { id: 1, title: 'Title', content: 'Content', createdAt: new Date(), userId: 1 };
            (createPostUseCase.execute as jest.Mock).mockResolvedValue(post);

            const request = {
                body: { title: 'Title', content: 'Content', userId: 1 },
                user: { id: '1' } // Mock authenticated user
            } as FastifyRequest;

            await postController.createPost(request, mockReply);

            expect(createPostUseCase.execute).toHaveBeenCalledWith('Title', 'Content', 1);
            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(post);
        });


        it('should handle and respond with status 500 on error', async () => {
            (createPostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            const request = {
                body: { title: 'Title', content: 'Content', userId: 1 },
                user: { id: '1' } // Mock authenticated user
            } as FastifyRequest;

            await postController.createPost(request, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });

    });

    describe('deletePost', () => {
        it('should return 204 if post is successfully deleted', async () => {
            (getPostUseCase.execute as jest.Mock).mockResolvedValue({ userId: 1 });
            (deletePostUseCase.execute as jest.Mock).mockResolvedValue(true);

            await postController.deletePost(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(204);
            expect(mockReply.send).not.toHaveBeenCalled();
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

        it('should return 500 if there is an internal server error', async () => {
            (getPostUseCase.execute as jest.Mock).mockRejectedValue(new Error('Internal Error'));

            await postController.deletePost(mockRequest, mockReply);

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


});
