import { FastifyInstance } from 'fastify';
import { PostController } from '../controllers/PostController';


export function postRoutes(server: FastifyInstance, controller: PostController): void {

    server.get<{ Params: { id: string } }>('/posts/:id', async (request, reply) => {
        return controller.getPost(request, reply);
    });

    server.post<{ Body: { title: string, content: string } }>('/posts', async (request, reply) => {
        return controller.createPost(request, reply);
    });

    server.put<{ Params: { id: string }, Body: { name: string, email: string } }>('/posts/:id', async (request, reply) => {
        return controller.updatePost(request, reply);
    });

    server.delete<{ Params: { id: string } }>('/posts/:id', async (request, reply) => {
        return controller.deletePost(request, reply);
    });

}
