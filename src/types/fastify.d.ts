// fastify.d.ts
import 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            roleId: number;
            name: string;
        };
    }

}
