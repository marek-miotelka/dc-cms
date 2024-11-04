import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CollectionsService } from '@api-server/content-manager/collections/collections.service';

export class DynamicCollectionsSwaggerPlugin {
  static async setup(app: INestApplication) {
    const collectionsService = app.get(CollectionsService);
    const collections = await collectionsService.findAll();

    // Create main API documentation
    const mainConfig = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription(
        `
Main API documentation including authentication and collection management.

### Available Documentation:
- [Main API Documentation](/) - Current page
- [Dynamic Collections API Documentation](/docs/collections) - Collection-specific endpoints
      `,
      )
      .addBearerAuth()
      .build();

    const mainDocument = SwaggerModule.createDocument(app, mainConfig);

    // Filter out collection-specific tags from main documentation
    mainDocument.tags = mainDocument.tags?.filter(
      (tag) => !tag.name.startsWith('collection/'),
    );

    SwaggerModule.setup('docs', app, mainDocument);

    // Create dynamic collections documentation
    const collectionsConfig = new DocumentBuilder()
      .setTitle('Dynamic Collections API')
      .setDescription(
        `
API endpoints for managing collection records. Each collection has its own set of CRUD endpoints.

### Available Documentation:
- [Main API Documentation](/docs) - Authentication and management endpoints
- [Dynamic Collections API Documentation](/docs/collections) - Current page
      `,
      )
      .addBearerAuth()
      .build();

    const collectionsDocument = SwaggerModule.createDocument(
      app,
      collectionsConfig,
      {
        include: [], // Don't include any controllers, we'll add paths manually
      },
    );

    // Initialize paths object if it doesn't exist
    collectionsDocument.paths = {};

    // Add dynamic paths for each collection
    collections.forEach((collection) => {
      const tag = `collection/${collection.slug}`;

      // Add collection tag
      collectionsDocument.tags?.push({
        name: tag,
        description: `Operations for ${collection.name} collection`,
      });

      // GET /{collectionSlug} - Get all records
      collectionsDocument.paths[`/${collection.slug}`] = {
        get: {
          tags: [tag],
          summary: `Get all ${collection.name} records`,
          security: [{ bearer: [] }],
          parameters: [
            {
              name: 'includeRelations',
              in: 'query',
              required: false,
              schema: {
                type: 'boolean',
              },
              description: 'Include related records in response',
            },
          ],
          responses: {
            '200': {
              description: 'List of records',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: this.generateFieldProperties(
                        collection.fields,
                      ),
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: [tag],
          summary: `Create a new ${collection.name} record`,
          security: [{ bearer: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data'],
                  properties: {
                    data: {
                      type: 'object',
                      properties: this.generateFieldProperties(
                        collection.fields,
                      ),
                    },
                    relations: {
                      type: 'object',
                      additionalProperties: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Record created successfully',
            },
          },
        },
      };

      // GET /{collectionSlug}/{documentId} - Get single record
      collectionsDocument.paths[`/${collection.slug}/{documentId}`] = {
        get: {
          tags: [tag],
          summary: `Get a single ${collection.name} record`,
          security: [{ bearer: [] }],
          parameters: [
            {
              name: 'documentId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'includeRelations',
              in: 'query',
              required: false,
              schema: {
                type: 'boolean',
              },
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
          },
        },
        put: {
          tags: [tag],
          summary: `Update a ${collection.name} record`,
          security: [{ bearer: [] }],
          parameters: [
            {
              name: 'documentId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data'],
                  properties: {
                    data: {
                      type: 'object',
                      properties: this.generateFieldProperties(
                        collection.fields,
                      ),
                    },
                    relations: {
                      type: 'object',
                      additionalProperties: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Record updated successfully',
            },
          },
        },
        delete: {
          tags: [tag],
          summary: `Delete a ${collection.name} record`,
          security: [{ bearer: [] }],
          parameters: [
            {
              name: 'documentId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '204': {
              description: 'Record deleted successfully',
            },
          },
        },
      };
    });

    // Add components section for auth
    collectionsDocument.components = {
      securitySchemes: {
        bearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    };

    // Setup the collections documentation as a separate tab
    SwaggerModule.setup('docs/collections', app, collectionsDocument);
  }

  private static generateFieldProperties(fields: any[]) {
    const properties: Record<string, any> = {
      documentId: {
        type: 'string',
        format: 'uuid',
        readOnly: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        readOnly: true,
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        readOnly: true,
      },
    };

    fields.forEach((field) => {
      if (field.type === 'relation') {
        properties[field.name] = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              data: {
                type: 'object',
                description: `Related ${field.relation.target} record`,
              },
            },
          },
        };
        return;
      }

      const fieldSchema: Record<string, any> = {
        type: this.mapFieldType(field.type),
      };

      if (field.description) {
        fieldSchema.description = field.description;
      }

      if (field.required) {
        fieldSchema.nullable = false;
      } else {
        fieldSchema.nullable = true;
      }

      properties[field.name] = fieldSchema;
    });

    return properties;
  }

  private static mapFieldType(fieldType: string): string {
    switch (fieldType) {
      case 'string':
      case 'longtext':
        return 'string';
      case 'number':
        return 'number';
      case 'integer':
        return 'integer';
      case 'boolean':
        return 'boolean';
      case 'date':
        return 'string';
      default:
        return 'string';
    }
  }
}
