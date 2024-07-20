// src/schemas/userSchemas.ts

export const getUserSchema = {
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

export const createUserSchema = {
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

export const updateUserSchema = {
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

export const deleteUserSchema = {
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


export const signInSchema = {
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
