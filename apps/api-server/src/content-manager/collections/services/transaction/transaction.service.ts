import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  CollectionFieldValidationException,
  CollectionRecordNotFoundException,
  DuplicateFieldValueException,
} from '@api-server/content-manager/collections/exceptions/collection.exceptions';
import { CollectionFields } from '@api-server/content-manager/collections/models/Collection.model';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async createRecord(
    collection: CollectionFields,
    data: any,
    relations?: Record<string, string[]>,
  ): Promise<any> {
    return this.knex.transaction(async (trx) => {
      // Validate required fields
      for (const field of collection.fields) {
        if (field.type !== 'relation' && field.required && !data[field.name]) {
          throw new CollectionFieldValidationException(
            `Field "${field.name}" is required`,
            { field },
          );
        }

        // Check unique constraints
        if (field.unique && data[field.name]) {
          const exists = await trx(`cm_${collection.slug}`)
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
      const documentId = this.generateUuid();
      const [record] = await trx(`cm_${collection.slug}`)
        .insert({
          ...data,
          documentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning('*');

      // Handle relations if provided
      if (relations) {
        await this.handleRelations(trx, collection, documentId, relations);
      }

      return record;
    });
  }

  async updateRecord(
    collection: CollectionFields,
    documentId: string,
    data: any,
    relations?: Record<string, string[]>,
  ): Promise<any> {
    return this.knex.transaction(async (trx) => {
      const record = await trx(`cm_${collection.slug}`)
        .where('documentId', documentId)
        .first();

      if (!record) {
        throw new CollectionRecordNotFoundException(
          documentId,
          collection.slug,
        );
      }

      // Check unique constraints
      for (const field of collection.fields) {
        if (field.unique && data[field.name]) {
          const exists = await trx(`cm_${collection.slug}`)
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
      const [updated] = await trx(`cm_${collection.slug}`)
        .where('documentId', documentId)
        .update({
          ...data,
          updatedAt: new Date(),
        })
        .returning('*');

      // Handle relations if provided
      if (relations) {
        await this.handleRelations(
          trx,
          collection,
          documentId,
          relations,
          true,
        );
      }

      return updated;
    });
  }

  async deleteRecord(
    collection: CollectionFields,
    documentId: string,
  ): Promise<void> {
    return this.knex.transaction(async (trx) => {
      const record = await trx(`cm_${collection.slug}`)
        .where('documentId', documentId)
        .first();

      if (!record) {
        throw new CollectionRecordNotFoundException(
          documentId,
          collection.slug,
        );
      }

      // Delete relations first
      const relationFields = collection.fields.filter(
        (field) => field.type === 'relation' && field.relation,
      );

      for (const field of relationFields) {
        if (!field.relation) continue;
        const relationTableName = `cm_rel_${collection.slug}_${field.relation.target}_${field.name}`;
        await trx(relationTableName).where('sourceId', documentId).delete();
      }

      // Delete main record
      await trx(`cm_${collection.slug}`)
        .where('documentId', documentId)
        .delete();
    });
  }

  private async handleRelations(
    trx: Knex.Transaction,
    collection: CollectionFields,
    documentId: string,
    relations: Record<string, string[]>,
    isUpdate: boolean = false,
  ): Promise<void> {
    for (const [fieldName, targetIds] of Object.entries(relations)) {
      const field = collection.fields.find((f) => f.name === fieldName);
      if (!field || field.type !== 'relation' || !field.relation) {
        continue;
      }

      const relationTableName = `cm_rel_${collection.slug}_${field.relation.target}_${fieldName}`;

      // If updating, delete existing relations first
      if (isUpdate) {
        await trx(relationTableName).where('sourceId', documentId).delete();
      }

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

  private generateUuid(): string {
    return uuidv4();
  }
}
