"use strict";
// src/schemas/postSchemas.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePostSchema = exports.updatePostSchema = exports.createPostSchema = exports.getPostSchema = void 0;
exports.getPostSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^[0-9]+$' } // Ensure id is a string of digits
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                title: { type: 'string' },
                content: { type: 'string' },
                userId: { type: 'integer' },
                createdAt: { type: 'string', format: 'date-time' } // Include createdAt if needed
            },
            required: ['id', 'title', 'content', 'userId', 'createdAt']
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error']
        },
    },
};
exports.createPostSchema = {
    body: {
        type: 'object',
        required: ['title', 'content', 'userId'],
        properties: {
            title: { type: 'string', minLength: 1 },
            content: { type: 'string', minLength: 10 },
            userId: { type: 'integer' },
        },
        additionalProperties: false
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                title: { type: 'string' },
                content: { type: 'string' },
                userId: { type: 'integer' },
                createdAt: { type: 'string', format: 'date-time' }
            },
            required: ['id', 'title', 'content', 'userId', 'createdAt']
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' },
                message: { type: 'string' }
            },
            required: ['error', 'message']
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string' },
                message: { type: 'string' }
            },
            required: ['error', 'message']
        },
    },
};
exports.updatePostSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^[0-9]+$' } // Ensure id is a string of digits
        }
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1 },
            content: { type: 'string', minLength: 10 },
        },
        additionalProperties: false // Disallow extra properties
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                title: { type: 'string' },
                content: { type: 'string' },
                userId: { type: 'integer' },
                createdAt: { type: 'string', format: 'date-time' }
            },
            required: ['id', 'title', 'content', 'userId', 'createdAt']
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' },
                message: { type: 'string' }
            },
            required: ['error', 'message']
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error']
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error']
        },
    },
};
exports.deletePostSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^[0-9]+$' } // Ensure id is a string of digits
        }
    },
    response: {
        204: {
            type: 'null',
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error']
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error']
        },
    },
};
