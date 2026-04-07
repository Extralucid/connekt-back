import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Youth Engagement Platform API',
      version: '1.0.0',
      description: 'API documentation for Youth Platform - Engage, Learn, and Grow Together',
      contact: {
        name: 'API Support',
        email: 'support@youthplatform.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            unom: { type: 'string' },
            uprenom: { type: 'string' },
            display_name: { type: 'string' },
            username: { type: 'string' },
            profile_picture_url: { type: 'string' },
            bio: { type: 'string' },
            accountType: { type: 'string', enum: ['INDIVIDUAL', 'COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'] },
            status: { type: 'string', enum: ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: { type: 'string', description: 'Email, phone, or username' },
            password: { type: 'string', format: 'password' },
            rememberMe: { type: 'boolean' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'phone', 'password', 'unom', 'uprenom'],
          properties: {
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            password: { type: 'string', format: 'password', minLength: 8 },
            unom: { type: 'string' },
            uprenom: { type: 'string' },
            username: { type: 'string' },
            accountType: { type: 'string', enum: ['INDIVIDUAL', 'COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO'] },
          },
        },
        Organization: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            type: { type: 'string' },
            logo: { type: 'string' },
            description: { type: 'string' },
            website: { type: 'string' },
            address: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;