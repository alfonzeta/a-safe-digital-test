// src/schemas/userSchemas.ts

import { format } from "path";

export const getUserSchema = {
    tags: ['User'],
    summary: 'Get user by ID',
    parameters: [
        {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
                pattern: '^[0-9]+$',
            },
        },
    ],
    responses: {
        200: {
            description: 'User details',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            roleId: { type: 'number' },
                        },
                    },
                },
            },
        },
        404: {
            description: 'User not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
};

export const createUserSchema = {
    tags: ['User'],
    summary: 'Create a new user',
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        },
        required: ['name', 'email', 'password'],
        additionalProperties: false
    },
    responses: {
        201: {
            description: 'User created successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                        },
                    },
                },
            },
        },
        400: {
            description: 'Bad request',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        404: {
            description: 'Resource not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
};
export const createAdminSchema = {
    tags: ['User'],
    summary: 'Create a new user',
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        },
        required: ['name', 'email', 'password'],
        additionalProperties: false
    },
    responses: {
        201: {
            description: 'User created successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                        },
                    },
                },
            },
        },
        400: {
            description: 'Bad request',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        404: {
            description: 'Resource not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};

export const updateUserSchema = {
    tags: ['User'],
    summary: 'Update user details',
    parameters: [
        {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
                pattern: '^[0-9]+$',
            },
        },
    ],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            roleId: { type: 'number', enum: [1, 2] },
        },
        additionalProperties: false
    },
    responses: {
        200: {
            description: 'User updated successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            roleId: { type: 'number' },
                        },
                    },
                },
            },
        },
        404: {
            description: 'User not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};

export const deleteUserSchema = {
    tags: ['User'],
    summary: 'Delete a user by ID',
    parameters: [
        {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
                pattern: '^[0-9]+$',
            },
        },
    ],
    responses: {
        204: {
            description: 'User deleted successfully',
        },
        404: {
            description: 'User not found',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, security: [
        {
            BearerAuth: [],
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};

export const signInSchema = {
    tags: ['User'],
    summary: 'Sign in a user',
    description: 'Allows a user to sign in using their email and password.',
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
        },
        additionalProperties: false
    },
    responses: {
        200: {
            description: 'Sign in successful',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'integer',
                                description: 'The unique identifier for the user.',
                            },
                            name: {
                                type: 'string',
                                description: 'The name of the user.',
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                description: 'The email address of the user.',
                            },
                        },
                        example: {
                            id: 1,
                            name: 'John Doe',
                            email: 'user@example.com',
                        },
                    },
                },
            },
        },
        401: {
            description: 'Invalid email or password',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string',
                                description: 'Error message indicating the issue.',
                            },
                        },
                        example: {
                            error: 'Invalid email or password',
                        },
                    },
                },
            },
        },
    },
};

export const uploadProfilePictureSchema = {
    tags: ['Picture'],
    summary: 'Upload a profile picture',
    description: 'Endpoint to upload a profile picture for the user',
    requestBody: {
        required: true,
        content: {
            'multipart/form-data': {
                schema: {
                    type: 'object',
                    properties: {
                        picture: {
                            type: 'string',
                            format: 'binary',
                        },
                    },
                    required: ['picture'],
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Profile picture uploaded successfully',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            location: { type: 'string' },
                        },
                    },
                },
            },
        },
        400: {
            description: 'Bad request',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        415: {
            description: 'Unsupported Media Type',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        413: {
            description: 'Payload Too Large',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
};