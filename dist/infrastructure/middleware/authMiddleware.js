"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const di_1 = require("../../config/di");
const jwtService = di_1.container.services.jwtService;
const authMiddleware = (requiredRoleId) => (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (userRoleId !== requiredRoleId) {
            reply.code(403).send({ error: 'Forbidden' });
            return;
        }
        // Attach user info to request for further processing
        request.user = { id: decodedToken.id, roleId: userRoleId, name: userName };
    }
    catch (error) {
        console.error('Authentication error:', error);
        reply.code(401).send({ error: 'Unauthorized' });
    }
});
exports.authMiddleware = authMiddleware;
