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
exports.authMiddleware = authMiddleware;
const di_1 = require("../../config/di");
// Extract the JwtService instance from the DI container
const jwtService = di_1.container.services.jwtService;
function authMiddleware(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            reply.code(401).send({ error: 'Authorization header is missing' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            reply.code(401).send({ error: 'Token is missing' });
            return;
        }
        try {
            const { id } = jwtService.verifyToken(token);
            request.userId = id; // Set userId in request for later use
        }
        catch (error) {
            reply.code(401).send({ error: 'Invalid token' });
        }
    });
}
