import { FastifyReply, FastifyRequest } from 'fastify';
import { IJwtService } from '../../domain/JwtRepository';
import { container } from '../../config/di';

const jwtService: IJwtService = container.services.jwtService;

export const authMiddleware = (requiredRoleId: number) => async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix
        const decodedToken = jwtService.verifyToken(token);


        if (!decodedToken || !decodedToken.id || !decodedToken.roleId) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }

        const userRoleId = decodedToken.roleId;
        const userName = decodedToken.name;

        // if (userRoleId !== requiredRoleId) {
        //     reply.code(403).send({ error: 'Forbidden' });
        //     return;
        // }

        // Attach user info to request for further processing
        request.user = { id: decodedToken.id, roleId: userRoleId, name: userName };
    } catch (error) {
        console.error('Authentication error:', error);
        reply.code(401).send({ error: 'Unauthorized' });
    }
};
