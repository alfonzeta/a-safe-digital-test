"use strict";
// src/schemas/userSchemas.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePictureSchema = exports.signInSchema = exports.deleteUserSchema = exports.updateUserSchema = exports.createUserSchema = exports.getUserSchema = void 0;
exports.getUserSchema = {
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
                name: { type: 'string' },
                email: { type: 'string' },
                roleId: { type: 'number' },
            },
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};
exports.createUserSchema = {
    body: {
        type: 'object',
        required: ['name', 'email', 'password'], // Include 'password' in required fields
        properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: {
                type: 'string',
                minLength: 6, // Example rule: minimum length of 6 characters
            },
        },
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
            },
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};
exports.updateUserSchema = {
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
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            roleId: { type: 'number' }
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                roleId: { type: 'number' }
            },
        },
    },
};
// src/schemas/userSchemas.ts
exports.deleteUserSchema = {
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
        },
    },
};
exports.signInSchema = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
            },
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};
exports.uploadProfilePictureSchema = {
    tags: ['User'],
    summary: 'Upload a profile picture',
    description: 'Endpoint to upload a profile picture for the user',
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
            required: ['message'],
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error'],
        },
        401: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error'],
        },
        500: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error'],
        },
    },
};
