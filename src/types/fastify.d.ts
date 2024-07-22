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
    export interface GetProfilePictureQuery {
        filename?: string; // Ensure this matches what you expect from your query string
    }
}
