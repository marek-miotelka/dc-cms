import { BaseModel, BaseModelFields } from '@api-server/database/base.model';
import { v4 as uuidv4 } from 'uuid';
import { Knex } from 'knex';

export type FieldType =
  | 'string'
  | 'longtext'
  | 'boolean'
  | 'number'
  | 'integer'
  | 'date'
  | 'relation';

export type RelationType = 'oneToOne' | 'oneToMany' | 'manyToMany';

export interface RelationConfig {
  type: RelationType;
  target: string; // Target collection slug
  bidirectional: boolean;
  inverseSide?: {
    field: string;
    displayField: string;
  };
}

export interface CollectionField {
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  description?: string;
  relation?: RelationConfig;
}

export interface CollectionFields extends BaseModelFields {
  name: string;
  slug: string;
  description?: string;
  parentId?: number; // Reference to parent collection
  fields: CollectionField[];
}

export class CollectionModel extends BaseModel<CollectionFields> {
  generateCollectionRecordUuid(): string {
    return uuidv4();
  }

  async findAll(): Promise<CollectionFields[]> {
    const collections = await this.knex(this.tableName).select('*');
    return collections.map((collection) => this.parseFields(collection));
  }

  async findByParentId(parentId: number | null): Promise<CollectionFields[]> {
    const collections = await this.knex(this.tableName)
      .where('parentId', parentId)
      .select('*');
    return collections.map((collection) => this.parseFields(collection));
  }

  async findBySlug(slug: string): Promise<CollectionFields | null> {
    const collection = await this.knex(this.tableName)
      .where('slug', slug)
      .first();
    return collection ? this.parseFields(collection) : null;
  }

  async findById(id: number): Promise<CollectionFields | null> {
    const collection = await super.findById(id);
    return collection ? this.parseFields(collection) : null;
  }

  async findByDocumentId(documentId: string): Promise<CollectionFields | null> {
    const collection = await super.findByDocumentId(documentId);
    return collection ? this.parseFields(collection) : null;
  }

  async create(data: Partial<CollectionFields>): Promise<CollectionFields> {
    if (!data.fields || !Array.isArray(data.fields)) {
      throw new Error('Fields must be a valid array');
    }

    const preparedData = {
      ...data,
      fields: JSON.stringify(data.fields),
      ...this.getBaseFields(),
    };

    const [id] = await this.knex(this.tableName).insert(preparedData);

    const collection = await this.findById(id);
    if (!collection) {
      throw new Error('Failed to create collection');
    }

    return collection;
  }

  async update(
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

  async updateCollectionTable(
    collection: CollectionFields,
    oldFields: CollectionField[],
  ): Promise<void> {
    if (!collection?.fields || !Array.isArray(collection.fields)) {
      throw new Error('Invalid collection fields');
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
      if (!field?.name || !field?.type || field.type === 'relation') {
        continue;
      }

      const oldField = oldFields.find((f) => f?.name === field.name);

      if (!oldField || oldField.type !== field.type) {
        // Add new field or modify existing one
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
              throw new Error(`Unsupported field type: ${field.type}`);
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

  private parseFields(collection: any): CollectionFields {
    if (!collection) {
      throw new Error('Invalid collection data');
    }

    try {
      return {
        ...collection,
        fields:
          typeof collection.fields === 'string'
            ? JSON.parse(collection.fields)
            : collection.fields,
      };
    } catch {
      throw new Error('Failed to parse collection fields');
    }
  }

  async createCollectionTable(collection: CollectionFields): Promise<void> {
    if (!collection?.fields || !Array.isArray(collection.fields)) {
      throw new Error('Invalid collection fields');
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

      // Add parent reference if this is a subcollection
      if (collection.parentId) {
        table.uuid('parentDocumentId').nullable();
        table
          .foreign('parentDocumentId')
          .references('documentId')
          .inTable(`cm_${collection.slug.split('/')[0]}`)
          .onDelete('CASCADE');
      }

      // Dynamic fields
      for (const field of collection.fields) {
        if (field.type === 'relation') {
          continue;
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
            throw new Error(`Unsupported field type: ${field.type}`);
        }

        if (field.required) {
          column.notNullable();
        }

        if (field.unique) {
          column.unique();
        }
      }
    });
  }

  async dropCollectionTable(slug: string): Promise<void> {
    const tableName = `cm_${slug}`;
    if (await this.knex.schema.hasTable(tableName)) {
      await this.knex.schema.dropTable(tableName);
    }
  }
}
