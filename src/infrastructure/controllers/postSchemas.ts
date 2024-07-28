// src/schemas/postSchemas.ts

export const getPostSchema = {
    tags: ['Post'],
    summary: 'Get Post by ID',
    parameters: [
        {
            name: 'id',
            in: 'path',
            pattern: '^[0-9]+$',
            required: true,
            schema: {
                type: 'string',
                pattern: '^[0-9]+$',
            },
        },
    ],
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
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            required: ['error']
        },
    },
};

export const createPostSchema = {
    tags: ['Post'],
    summary: 'Create Post - Must include existent userId',
    body: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
            title: { type: 'string', minLength: 1 },
            content: { type: 'string', minLength: 10 },
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

export const updatePostSchema = {
    tags: ['Post'],
    summary: 'Update Post by ID',
    parameters: {
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
export const deletePostSchema = {
    tags: ['Post'],
    summary: 'Delete Post by ID',
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
