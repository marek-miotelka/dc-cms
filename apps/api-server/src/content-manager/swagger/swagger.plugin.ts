import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ParameterObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { CollectionFields } from '@api-server/content-manager/collections/models/Collection.model';
import { CollectionsService } from '@api-server/content-manager/collections/collections.service';

export class DynamicCollectionsSwaggerPlugin {
  static async setup(app: INestApplication): Promise<void> {
    // Create main API document
    const mainConfig = new DocumentBuilder()
      .setTitle('DistCode CMS API')
      .setDescription('API documentation for DistCode CMS')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const mainDocument = SwaggerModule.createDocument(app, mainConfig);

    // Create collections API document
    const collectionsConfig = new DocumentBuilder()
      .setTitle('Collections API')
      .setDescription('Dynamic Collections API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const collectionsDocument = SwaggerModule.createDocument(
      app,
      collectionsConfig,
    );
    collectionsDocument.paths = {};
    collectionsDocument.tags = [];

    // Get collections from service
    const collectionsService = app.get(CollectionsService);
    const collections = await collectionsService.findAll();

    collections.forEach((collection) => {
      const tag = `collection/${collection.slug}`;
      const basePath = `/content-manager/collections/${collection.slug}`;

      collectionsDocument.tags?.push({
        name: tag,
        description: `Operations for ${collection.name} collection`,
      });

      // GET and POST endpoints
      collectionsDocument.paths[basePath] = {
        get: {
          tags: [tag],
          summary: `Get all ${collection.name} records`,
          security: [{ bearer: [] }],
          parameters: [
            ...this.getPaginationParameters(),
            ...this.getSortingParameters(),
            ...this.getFilterParameters(),
            {
              name: 'includeRelations',
              in: 'query',
              required: false,
              schema: {
                type: 'boolean',
              } as SchemaObject,
              description: 'Include related records in response',
            },
          ],
          responses: {
            '200': {
              description: 'List of records with pagination metadata',
              content: {
                'application/json': {
                  schema: this.getResponseSchema(collection),
                },
              },
            },
          },
        },
        post: {
          tags: [tag],
          summary: `Create new ${collection.name} record`,
          security: [{ bearer: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: this.getRequestBodySchema(collection),
              },
            },
          },
          responses: {
            '201': {
              description: 'Record created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: this.generateFieldProperties(collection.fields),
                  },
                },
              },
            },
          },
        },
      };

      // Individual record operations
      collectionsDocument.paths[`${basePath}/{documentId}`] = {
        get: {
          tags: [tag],
          summary: `Get single ${collection.name} record`,
          security: [{ bearer: [] }],
          parameters: [
            {
              name: 'documentId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              } as SchemaObject,
            },
            {
              name: 'includeRelations',
              in: 'query',
              required: false,
              schema: {
                type: 'boolean',
              } as SchemaObject,
            },
          ],
          responses: {
            '200': {
              description: 'Record details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: this.generateFieldProperties(collection.fields),
                  },
                },
              },
            },
            '404': {
              description: 'Record not found',
            },
          },
        },
        put: {
          tags: [tag],
          summary: `Update ${collection.name} record`,
          security: [{ bearer: [] }],
          parameters: [
            {
              name: 'documentId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              } as SchemaObject,
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: this.getRequestBodySchema(collection),
              },
            },
          },
          responses: {
            '200': {
              description: 'Record updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: this.generateFieldProperties(collection.fields),
                  },
                },
              },
            },
            '404': {
              description: 'Record not found',
            },
          },
        },
        delete: {
          tags: [tag],
          summary: `Delete ${collection.name} record`,
          security: [{ bearer: [] }],
          parameters: [
            {
              name: 'documentId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              } as SchemaObject,
            },
          ],
          responses: {
            '204': {
              description: 'Record deleted successfully',
            },
            '404': {
              description: 'Record not found',
            },
          },
        },
      };
    });

    // Setup both documents with navigation
    const mainHtml = `
        <style>
        .custom_nav {
        padding: 1rem; background: #1b1b1b; display: flex; gap: 1.5rem; font-size: 0.5rem; white-space: nowrap; justify-content: end;
        }
        </style>
        <a href="/docs" style="color: white; text-decoration: none;">Main API</a>
        <a href="/docs/collections" style="color: white; text-decoration: none;">Collections API</a>
    `;

    const mainOptions = {
      customSiteTitle: 'Distcode CMS API',
      customJsStr: [
        `
        setTimeout(function () {
      const nav = document.createElement('div');
      nav.classList.add('custom_nav');
      const topbar = document.querySelector('.topbar-wrapper');
      nav.innerHTML = \`${mainHtml.trim()}\`;
      console.log(topbar);
      topbar?.append(nav);
    }, 100);
        `,
      ],
    };

    const collectionsOptions = {
      customSiteTitle: 'Collections API - Distcode CMS',
      customJsStr: [
        `
        setTimeout(function () {
      const nav = document.createElement('div');
      nav.classList.add('custom_nav');
      const topbar = document.querySelector('.topbar-wrapper');
      nav.innerHTML = \`${mainHtml.trim()}\`;
      console.log(topbar);
      topbar?.append(nav);
    }, 100);
        `,
      ],
    };

    SwaggerModule.setup('docs', app, mainDocument, mainOptions);
    SwaggerModule.setup(
      'docs/collections',
      app,
      collectionsDocument,
      collectionsOptions,
    );
  }

  private static getPaginationParameters(): ParameterObject[] {
    return [
      {
        name: 'paginationType',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          enum: ['cursor', 'page'],
          default: 'page',
        } as SchemaObject,
        description: 'Type of pagination to use',
      },
      {
        name: 'page',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        } as SchemaObject,
        description: 'Page number (when using page-based pagination)',
      },
      {
        name: 'perPage',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
        } as SchemaObject,
        description: 'Items per page (when using page-based pagination)',
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
        } as SchemaObject,
        description:
          'Cursor for pagination (when using cursor-based pagination)',
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
        } as SchemaObject,
        description:
          'Number of items to return (when using cursor-based pagination)',
      },
    ];
  }

  private static getSortingParameters(): ParameterObject[] {
    return [
      {
        name: 'sort',
        in: 'query',
        required: false,
        schema: {
          type: 'array',
          items: {
            type: 'string',
            pattern: '^[a-zA-Z0-9_]+(:(asc|desc))?$',
          },
        } as SchemaObject,
        style: 'form',
        explode: false,
        description: 'Sorting criteria (e.g., field:asc or field:desc)',
      },
    ];
  }

  private static getFilterParameters(): ParameterObject[] {
    return [
      {
        name: 'filter',
        in: 'query',
        required: false,
        schema: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              eq: { type: 'string' },
              neq: { type: 'string' },
              gt: { type: 'string' },
              gte: { type: 'string' },
              lt: { type: 'string' },
              lte: { type: 'string' },
              like: { type: 'string' },
              in: {
                type: 'array',
                items: { type: 'string' },
              },
              between: {
                type: 'array',
                items: { type: 'string' },
                minItems: 2,
                maxItems: 2,
              },
              null: { type: 'boolean' },
              notNull: { type: 'boolean' },
            },
          },
        } as SchemaObject,
        description: 'Filter criteria',
      },
    ];
  }

  private static getResponseSchema(collection: CollectionFields): SchemaObject {
    return {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: this.generateFieldProperties(collection.fields),
          },
        },
        meta: {
          type: 'object',
          oneOf: [
            {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['cursor'] },
                hasMore: { type: 'boolean' },
                nextCursor: { type: 'string' },
                prevCursor: { type: 'string' },
                total: { type: 'integer' },
              },
            },
            {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['page'] },
                currentPage: { type: 'integer' },
                perPage: { type: 'integer' },
                total: { type: 'integer' },
                pageCount: { type: 'integer' },
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' },
              },
            },
          ],
        },
      },
    };
  }

  private static generateFieldProperties(
    fields: CollectionFields['fields'],
  ): Record<string, SchemaObject> {
    const properties: Record<string, SchemaObject> = {
      documentId: { type: 'string', format: 'uuid' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    };

    fields.forEach((field) => {
      if (field.type === 'relation') {
        properties[field.name] = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        };
      } else {
        properties[field.name] = this.getFieldSchema(field);
      }
    });

    return properties;
  }

  private static getFieldSchema(field: any): SchemaObject {
    switch (field.type) {
      case 'string':
      case 'longtext':
        return { type: 'string' };
      case 'number':
        return { type: 'number' };
      case 'integer':
        return { type: 'integer' };
      case 'boolean':
        return { type: 'boolean' };
      case 'date':
        return { type: 'string', format: 'date-time' };
      default:
        return { type: 'string' };
    }
  }

  private static getRequestBodySchema(
    collection: CollectionFields,
  ): SchemaObject {
    return {
      type: 'object',
      required: ['data'],
      properties: {
        data: {
          type: 'object',
          properties: this.generateFieldProperties(collection.fields),
        },
        relations: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
      },
    };
  }
}
