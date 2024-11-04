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

  // Dynamic Collection Methods

  async getCollectionData(slug: string): Promise<any[]> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      return this.knex(`cm_${slug}`).select('*');
    } catch (error) {
      if (error instanceof CollectionNotFoundException) {
        throw error;
      }
      throw new CollectionOperationException('getCollectionData', error);
    }
  }

  async getCollectionRecord(slug: string, documentId: string): Promise<any> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      const record = await this.knex(`cm_${slug}`)
        .where('documentId', documentId)
        .first();

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

  async createCollectionRecord(slug: string, data: any): Promise<any> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      // Validate required fields
      for (const field of collection.fields) {
        if (field.required && !data[field.name]) {
          throw new CollectionFieldValidationException(
            `Field "${field.name}" is required`,
            { field },
          );
        }

        // Check unique constraints
        if (field.unique && data[field.name]) {
          const exists = await this.knex(`cm_${slug}`)
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

      // Insert record with base fields
      const [record] = await this.knex(`cm_${slug}`)
        .insert({
          ...data,
          documentId: this.collectionModel.generateCollectionRecordUuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning('*');

      return record;
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
  ): Promise<any> {
    try {
      const collection = await this.findBySlug(slug);
      if (!collection) {
        throw new CollectionNotFoundException(slug);
      }

      const record = await this.knex(`cm_${slug}`)
        .where('documentId', documentId)
        .first();

      if (!record) {
        throw new CollectionRecordNotFoundException(documentId, slug);
      }

      // Check unique constraints
      for (const field of collection.fields) {
        if (field.unique && data[field.name]) {
          const exists = await this.knex(`cm_${slug}`)
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

      // Update record
      const [updated] = await this.knex(`cm_${slug}`)
        .where('documentId', documentId)
        .update({
          ...data,
          updatedAt: new Date(),
        })
        .returning('*');

      return updated;
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

      const record = await this.knex(`cm_${slug}`)
        .where('documentId', documentId)
        .first();

      if (!record) {
        throw new CollectionRecordNotFoundException(documentId, slug);
      }

      await this.knex(`cm_${slug}`).where('documentId', documentId).delete();
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
