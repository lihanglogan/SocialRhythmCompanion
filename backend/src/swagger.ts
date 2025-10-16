import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Rhythm Companion API',
      version: '1.0.0',
      description: '社交节奏伴侣 - 智能场所推荐与社交匹配 API',
      contact: {
        name: 'API Support',
        email: 'support@socialrhythm.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: '开发环境',
      },
      {
        url: 'https://api.socialrhythm.com/api',
        description: '生产环境',
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
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            nickname: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
            birthYear: { type: 'integer', nullable: true },
            latitude: { type: 'number', nullable: true },
            longitude: { type: 'number', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Place: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            address: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            categoryId: { type: 'string', format: 'uuid' },
            description: { type: 'string', nullable: true },
            businessHours: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            avgRating: { type: 'number', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PlaceCategory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            icon: { type: 'string' },
            description: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            placeId: { type: 'string', format: 'uuid' },
            crowdnessLevel: { type: 'integer', minimum: 1, maximum: 5 },
            waitTime: { type: 'integer', nullable: true },
            serviceQuality: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
            priceLevel: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
            noiseLevel: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
            comment: { type: 'string', nullable: true },
            photos: { type: 'array', items: { type: 'string' } },
            isAnonymous: { type: 'boolean' },
            reportedAt: { type: 'string', format: 'date-time' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            requesterId: { type: 'string', format: 'uuid' },
            targetId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
            message: { type: 'string', nullable: true },
            responseMessage: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            respondedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        ActivitySuggestion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['PERSONAL', 'TRENDING', 'SYSTEM'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            validUntil: { type: 'string', format: 'date-time' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'integer' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Social Rhythm Companion API',
  }));
};

export { specs };