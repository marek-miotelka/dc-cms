import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CollectionFields, CollectionModel } from './models/Collection.model';
import { CrudService } from '@api-server/database/crud.service';
import { Knex } from 'knex';
import {
  CollectionAlreadyExistsException,
  CollectionFieldValidationException,
  CollectionNotFoundException,
  CollectionOperationException,
  CollectionRecordNotFoundException,
  DuplicateFieldValueException,
} from './exceptions/collection.exceptions';

@Injectable()
export class CollectionsService
  extends CrudService<CollectionFields>
  implements OnModuleInit
{
  private collectionModel!: CollectionModel;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    super();
  }

  onModuleInit() {
    this.collectionModel = new CollectionModel({
      tableName: 'collections',
      knex: this.knex,
    });
    this.setModel(this.collectionModel);
  }

  async findAll(): Promise<CollectionFields[]> {
    return this.collectionModel.findAll();
  }

  async findBySlug(slug: string): Promise<CollectionFields | null> {
    if (!slug) {
      throw new CollectionFieldValidationException('Slug is required', {
        slug,
      });
    }
    return this.collectionModel.findBySlug(slug);
  }

  async create(data: Partial<CollectionFields>): Promise<CollectionFields> {
    try {
      if (!data.slug) {
        throw new CollectionFieldValidationException('Slug is required', {
          data,
        });
      }

      // Check if collection with slug already exists
      const existing = await this.findBySlug(data.slug);
      if (existing) {
        throw new CollectionAlreadyExistsException(data.slug);
      }

      // Validate relation fields
      await this.validateRelationFields(data.fields || []);

      // Create collection record
      const collection = await this.collectionModel.create(data);
      if (!collection) {
        throw new CollectionOperationException(
          'create',
          new Error('Failed to create collection record'),
        );
      }

      // Create collection table
      await this.collectionModel.createCollectionTable(collection);

      return collection;
    } catch (error) {
      if (
        error instanceof CollectionAlreadyExistsException ||
        error instanceof CollectionFieldValidationException
      ) {
        throw error;
      }
      throw new CollectionOperationException('create', error);
    }
  }

  async update(
    id: number,
    data: Partial<CollectionFields>,
  ): Promise<CollectionFields> {
    try {
      // Get existing collection
      const existing = await this.collectionModel.findById(id);
      if (!existing) {
        throw new CollectionNotFoundException(id.toString());
      }

      // If slug is being changed, check if new slug is available
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await this.findBySlug(data.slug);
        if (slugExists) {
          throw new CollectionAlreadyExistsException(data.slug);
        }
      }

      // Validate relation fields if provided
      if (data.fields) {
        await this.validateRelationFields(data.fields);
      }

      // Update collection fields if provided
      if (data.fields) {
        await this.collectionModel.updateCollectionTable(
          { ...existing, ...data },
          existing.fields,
        );
      }

      // Update collection record
      const updated = await this.collectionModel.update(id, data);
      if (!updated) {
        throw new CollectionOperationException(
          'update',
          new Error('Failed to update collection record'),
        );
      }

      return updated;
    } catch (error) {
      if (
        error instanceof CollectionNotFoundException ||
        error instanceof CollectionAlreadyExistsException
      ) {
        throw error;
      }
      throw new CollectionOperationException('update', error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const collection = await this.collectionModel.findById(id);
      if (!collection) {
        throw new CollectionNotFoundException(id.toString());
      }

      // Drop collection table first
      await this.collectionModel.dropCollectionTable(collection.slug);

      // Delete collection record
      await super.delete(id);
    } catch (error) {
      if (error instanceof CollectionNotFoundException) {
        throw error;
      }
      throw new CollectionOperationException('delete', error);
    }
  }

  // Update the validateRelationFields method with proper type guards
  private async validateRelationFields(
    fields: CollectionFields['fields'],
  ): Promise<void> {
    for (const field of fields) {
      if (field.type === 'relation') {
        // Type guard for relation field
        if (!field.relation) {
          throw new CollectionFieldValidationException(
            'Relation configuration is required for relation fields',
            { field },
          );
        }

        // Check if target collection exists
        const targetCollection = await this.findBySlug(field.relation.target);
        if (!targetCollection) {
          throw new CollectionFieldValidationException(
            `Target collection "${field.relation.target}" not found`,
            { field },
          );
        }

        // Validate bidirectional relation configuration
        if (field.relation.bidirectional) {
          if (!field.relation.inverseSide) {
            throw new CollectionFieldValidationException(
              'Inverse side configuration is required for bidirectional relations',
              { field },
            );
          }

          // Check if the inverse field exists in the target collection
          const inverseField = targetCollection.fields.find(
            (f) => f.name === field.relation?.inverseSide?.field,
          );
          if (!inverseField) {
            throw new CollectionFieldValidationException(
              `Inverse field "${field.relation.inverseSide.field}" not found in target collection`,
              { field },
            );
          }

          // Check if the display field exists in the target collection
          const displayField = targetCollection.fields.find(
            (f) => f.name === field.relation?.inverseSide?.displayField,
          );
          if (!displayField) {
            throw new CollectionFieldValidationException(
              `Display field "${field.relation.inverseSide.displayField}" not found in target collection`,
              { field },
            );
          }
        }
      }
    }
  }

  // Dynamic Collection Methods

  async getCollectionData(
    slug: string,
    includeRelations: boolean = false,
  ): Promise<any[]> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      let query = this.knex(`cm_${slug}`).select('*');

      if (includeRelations) {
        const relationFields = collection.fields.filter(
          (field) => field.type === 'relation',
        );

        for (const field of relationFields) {
          if (!field.relation) continue;

          const relationTableName = `cm_rel_${slug}_${field.relation.target}_${field.name}`;
          const targetTableName = `cm_${field.relation.target}`;

          query = query
            .leftJoin(
              relationTableName,
              `cm_${slug}.documentId`,
              `${relationTableName}.sourceId`,
            )
            .leftJoin(
              targetTableName,
              `${relationTableName}.targetId`,
              `${targetTableName}.documentId`,
            )
            .select(
              this.knex.raw(
                `JSON_ARRAYAGG(JSON_OBJECT('id', ${targetTableName}.documentId, 'data', ${targetTableName}.*)) as ${field.name}`,
              ),
            )
            .groupBy(`cm_${slug}.documentId`);
        }
      }

      return query;
    } catch (error) {
      if (error instanceof CollectionNotFoundException) {
        throw error;
      }
      throw new CollectionOperationException('getCollectionData', error);
    }
  }

  async getCollectionRecord(
    slug: string,
    documentId: string,
    includeRelations: boolean = false,
  ): Promise<any> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      let query = this.knex(`cm_${slug}`)
        .where(`cm_${slug}.documentId`, documentId)
        .first();

      if (includeRelations) {
        const relationFields = collection.fields.filter(
          (field) => field.type === 'relation',
        );

        for (const field of relationFields) {
          if (!field.relation) continue;

          const relationTableName = `cm_rel_${slug}_${field.relation.target}_${field.name}`;
          const targetTableName = `cm_${field.relation.target}`;

          query = query
            .leftJoin(
              relationTableName,
              `cm_${slug}.documentId`,
              `${relationTableName}.sourceId`,
            )
            .leftJoin(
              targetTableName,
              `${relationTableName}.targetId`,
              `${targetTableName}.documentId`,
            )
            .select(
              this.knex.raw(
                `JSON_ARRAYAGG(JSON_OBJECT('id', ${targetTableName}.documentId, 'data', ${targetTableName}.*)) as ${field.name}`,
              ),
            );
        }
      }

      const record = await query;

      if (!record) {
        throw new CollectionRecordNotFoundException(documentId, slug);
      }

      return record;
    } catch (error) {
      if (
        error instanceof CollectionNotFoundException ||
        error instanceof CollectionRecordNotFoundException
      ) {
        throw error;
      }
      throw new CollectionOperationException('getCollectionRecord', error);
    }
  }

  async createCollectionRecord(
    slug: string,
    data: any,
    relations?: Record<string, string[]>,
  ): Promise<any> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      // Start transaction
      return await this.knex.transaction(async (trx) => {
        // Validate required fields
        for (const field of collection.fields) {
          if (
            field.type !== 'relation' &&
            field.required &&
            !data[field.name]
          ) {
            throw new CollectionFieldValidationException(
              `Field "${field.name}" is required`,
              { field },
            );
          }

          // Check unique constraints
          if (field.unique && data[field.name]) {
            const exists = await trx(`cm_${slug}`)
              .where(field.name, data[field.name])
              .first();

            if (exists) {
              throw new DuplicateFieldValueException(
                field.name,
                data[field.name],
              );
            }
          }
        }

        // Create main record
        const documentId = this.collectionModel.generateCollectionRecordUuid();
        const [record] = await trx(`cm_${slug}`)
          .insert({
            ...data,
            documentId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning('*');

        // Handle relations if provided
        if (relations) {
          for (const [fieldName, targetIds] of Object.entries(relations)) {
            const field = collection.fields.find((f) => f.name === fieldName);
            if (!field || field.type !== 'relation' || !field.relation) {
              continue;
            }

            const relationTableName = `cm_rel_${slug}_${field.relation.target}_${fieldName}`;

            // Insert relation records
            await trx(relationTableName).insert(
              targetIds.map((targetId) => ({
                sourceId: documentId,
                targetId,
                createdAt: new Date(),
                updatedAt: new Date(),
              })),
            );
          }
        }

        return record;
      });
    } catch (error) {
      if (
        error instanceof CollectionNotFoundException ||
        error instanceof CollectionFieldValidationException ||
        error instanceof DuplicateFieldValueException
      ) {
        throw error;
      }
      throw new CollectionOperationException('createCollectionRecord', error);
    }
  }

  async updateCollectionRecord(
    slug: string,
    documentId: string,
    data: any,
    relations?: Record<string, string[]>,
  ): Promise<any> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      return await this.knex.transaction(async (trx) => {
        const record = await trx(`cm_${slug}`)
          .where('documentId', documentId)
          .first();

        if (!record) {
          throw new CollectionRecordNotFoundException(documentId, slug);
        }

        // Check unique constraints
        for (const field of collection.fields) {
          if (field.unique && data[field.name]) {
            const exists = await trx(`cm_${slug}`)
              .where(field.name, data[field.name])
              .whereNot('documentId', documentId)
              .first();

            if (exists) {
              throw new DuplicateFieldValueException(
                field.name,
                data[field.name],
              );
            }
          }
        }

        // Update main record
        const [updated] = await trx(`cm_${slug}`)
          .where('documentId', documentId)
          .update({
            ...data,
            updatedAt: new Date(),
          })
          .returning('*');

        // Handle relations if provided
        if (relations) {
          for (const [fieldName, targetIds] of Object.entries(relations)) {
            const field = collection.fields.find((f) => f.name === fieldName);
            if (!field || field.type !== 'relation' || !field.relation) {
              continue;
            }

            const relationTableName = `cm_rel_${slug}_${field.relation.target}_${fieldName}`;
            // Delete existing relations
            await trx(relationTableName).where('sourceId', documentId).delete();

            // Insert new relations
            if (targetIds.length > 0) {
              await trx(relationTableName).insert(
                targetIds.map((targetId) => ({
                  sourceId: documentId,
                  targetId,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })),
              );
            }
          }
        }

        return updated;
      });
    } catch (error) {
      if (
        error instanceof CollectionNotFoundException ||
        error instanceof CollectionRecordNotFoundException ||
        error instanceof DuplicateFieldValueException
      ) {
        throw error;
      }
      throw new CollectionOperationException('updateCollectionRecord', error);
    }
  }

  async deleteCollectionRecord(
    slug: string,
    documentId: string,
  ): Promise<void> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      return await this.knex.transaction(async (trx) => {
        const record = await trx(`cm_${slug}`)
          .where('documentId', documentId)
          .first();

        if (!record) {
          throw new CollectionRecordNotFoundException(documentId, slug);
        }

        // Delete relations first
        const relationFields = collection.fields.filter(
          (field) => field.type === 'relation' && field.relation,
        );

        for (const field of relationFields) {
          if (!field.relation) continue;
          const relationTableName = `cm_rel_${slug}_${field.relation.target}_${field.name}`;
          await trx(relationTableName).where('sourceId', documentId).delete();
        }

        // Delete main record
        await trx(`cm_${slug}`).where('documentId', documentId).delete();
      });
    } catch (error) {
      if (
        error instanceof CollectionNotFoundException ||
        error instanceof CollectionRecordNotFoundException
      ) {
        throw error;
      }
      throw new CollectionOperationException('deleteCollectionRecord', error);
    }
  }
}
