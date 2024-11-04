import { BaseModel, BaseModelFields } from '@api-server/database/base.model';
import { Knex } from 'knex';
import { CollectionFieldValidationException } from '../exceptions/collection.exceptions';

export type FieldType =
  | 'string'
  | 'longtext'
  | 'boolean'
  | 'number'
  | 'integer'
  | 'date';

export interface CollectionField {
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  description?: string;
}

export interface CollectionFields extends BaseModelFields {
  name: string;
  slug: string;
  description?: string;
  fields: CollectionField[];
}

export class CollectionModel extends BaseModel<CollectionFields> {
  constructor(options: { tableName: string; knex: Knex }) {
    super(options);
  }

  generateCollectionRecordUuid(): string {
    return this.generateUuid();
  }

  override async findAll(): Promise<CollectionFields[]> {
    const collections = await this.knex(this.tableName).select('*');
    return collections.map((collection) => this.parseFields(collection));
  }

  override async findById(id: number): Promise<CollectionFields | null> {
    const collection = await super.findById(id);
    return collection ? this.parseFields(collection) : null;
  }

  override async findByDocumentId(
    documentId: string,
  ): Promise<CollectionFields | null> {
    const collection = await super.findByDocumentId(documentId);
    return collection ? this.parseFields(collection) : null;
  }

  async findBySlug(slug: string): Promise<CollectionFields | null> {
    const collection = await this.knex(this.tableName)
      .where('slug', slug)
      .first();
    return collection ? this.parseFields(collection) : null;
  }

  override async create(
    data: Partial<CollectionFields>,
  ): Promise<CollectionFields> {
    if (!data.fields || !Array.isArray(data.fields)) {
      throw new CollectionFieldValidationException(
        'Fields must be a valid array',
        { fields: data.fields },
      );
    }

    const preparedData = {
      ...data,
      fields: JSON.stringify(data.fields),
      ...this.getBaseFields(),
    };

    // For MySQL, we need to insert first then fetch
    const [id] = await this.knex(this.tableName).insert(preparedData);

    const collection = await this.findById(id);
    if (!collection) {
      throw new Error('Failed to create collection');
    }

    return collection;
  }

  override async update(
    id: number,
    data: Partial<CollectionFields>,
  ): Promise<CollectionFields | null> {
    const preparedData = {
      ...data,
      fields: data.fields ? JSON.stringify(data.fields) : undefined,
      ...this.updateTimestamp(),
    };

    await this.knex(this.tableName).where('id', id).update(preparedData);

    return this.findById(id);
  }

  private parseFields(collection: any): CollectionFields {
    if (!collection) {
      throw new CollectionFieldValidationException('Invalid collection data', {
        collection,
      });
    }

    try {
      return {
        ...collection,
        fields:
          typeof collection.fields === 'string'
            ? JSON.parse(collection.fields)
            : collection.fields,
      };
    } catch (error) {
      throw new CollectionFieldValidationException(
        'Failed to parse collection fields',
        { fields: collection.fields, error: error.message },
      );
    }
  }

  async createCollectionTable(collection: CollectionFields): Promise<void> {
    if (!collection?.fields || !Array.isArray(collection.fields)) {
      throw new CollectionFieldValidationException(
        'Invalid collection fields',
        { collection },
      );
    }

    const tableName = `cm_${collection.slug}`;

    if (await this.knex.schema.hasTable(tableName)) {
      throw new Error(`Table ${tableName} already exists`);
    }

    await this.knex.schema.createTable(tableName, (table) => {
      // Base fields
      table.increments('id').primary();
      table.uuid('documentId').notNullable().unique();
      table.timestamp('createdAt').notNullable().defaultTo(this.knex.fn.now());
      table.timestamp('updatedAt').notNullable().defaultTo(this.knex.fn.now());

      // Dynamic fields
      collection.fields.forEach((field) => {
        if (!field?.name || !field?.type) {
          throw new CollectionFieldValidationException(
            'Invalid field definition',
            { field },
          );
        }

        let column: Knex.ColumnBuilder;

        switch (field.type) {
          case 'string':
            column = table.string(field.name);
            break;
          case 'longtext':
            column = table.text(field.name);
            break;
          case 'boolean':
            column = table.boolean(field.name);
            break;
          case 'number':
            column = table.float(field.name);
            break;
          case 'integer':
            column = table.integer(field.name);
            break;
          case 'date':
            column = table.datetime(field.name);
            break;
          default:
            throw new CollectionFieldValidationException(
              `Unsupported field type: ${field.type}`,
              { field },
            );
        }

        if (field.required) {
          column.notNullable();
        }

        if (field.unique) {
          column.unique();
        }
      });
    });
  }

  async updateCollectionTable(
    collection: CollectionFields,
    oldFields: CollectionField[],
  ): Promise<void> {
    if (!collection?.fields || !Array.isArray(collection.fields)) {
      throw new CollectionFieldValidationException(
        'Invalid collection fields',
        { collection },
      );
    }

    if (!oldFields || !Array.isArray(oldFields)) {
      throw new CollectionFieldValidationException('Invalid old fields', {
        oldFields,
      });
    }

    const tableName = `cm_${collection.slug}`;

    // Remove deleted fields
    for (const oldField of oldFields) {
      if (!oldField?.name) continue;

      const fieldExists = collection.fields.find(
        (field) => field?.name === oldField.name,
      );
      if (!fieldExists) {
        await this.knex.schema.alterTable(tableName, (table) => {
          table.dropColumn(oldField.name);
        });
      }
    }

    // Add new fields or modify existing ones
    for (const field of collection.fields) {
      if (!field?.name || !field?.type) {
        throw new CollectionFieldValidationException(
          'Invalid field definition',
          { field },
        );
      }

      const oldField = oldFields.find((f) => f?.name === field.name);

      if (!oldField) {
        // Add new field
        await this.knex.schema.alterTable(tableName, (table) => {
          let column: Knex.ColumnBuilder;

          switch (field.type) {
            case 'string':
              column = table.string(field.name);
              break;
            case 'longtext':
              column = table.text(field.name);
              break;
            case 'boolean':
              column = table.boolean(field.name);
              break;
            case 'number':
              column = table.float(field.name);
              break;
            case 'integer':
              column = table.integer(field.name);
              break;
            case 'date':
              column = table.datetime(field.name);
              break;
            default:
              throw new CollectionFieldValidationException(
                `Unsupported field type: ${field.type}`,
                { field },
              );
          }

          if (field.required) {
            column.notNullable();
          }

          if (field.unique) {
            column.unique();
          }
        });
      } else if (
        field.type !== oldField.type ||
        field.required !== oldField.required ||
        field.unique !== oldField.unique
      ) {
        // Modify existing field
        await this.knex.schema.alterTable(tableName, (table) => {
          // Drop existing column
          table.dropColumn(field.name);
        });

        await this.knex.schema.alterTable(tableName, (table) => {
          // Recreate column with new properties
          let column: Knex.ColumnBuilder;

          switch (field.type) {
            case 'string':
              column = table.string(field.name);
              break;
            case 'longtext':
              column = table.text(field.name);
              break;
            case 'boolean':
              column = table.boolean(field.name);
              break;
            case 'number':
              column = table.float(field.name);
              break;
            case 'integer':
              column = table.integer(field.name);
              break;
            case 'date':
              column = table.datetime(field.name);
              break;
            default:
              throw new CollectionFieldValidationException(
                `Unsupported field type: ${field.type}`,
                { field },
              );
          }

          if (field.required) {
            column.notNullable();
          }

          if (field.unique) {
            column.unique();
          }
        });
      }
    }
  }

  async dropCollectionTable(slug: string): Promise<void> {
    const tableName = `cm_${slug}`;
    if (await this.knex.schema.hasTable(tableName)) {
      await this.knex.schema.dropTable(tableName);
    }
  }
}
