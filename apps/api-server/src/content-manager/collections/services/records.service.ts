import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { CollectionFields } from '../models/Collection.model';
import { CollectionRelationsService } from './relations.service';
import {
  CollectionFieldValidationException,
  CollectionRecordNotFoundException,
  DuplicateFieldValueException,
} from '../exceptions/collection.exceptions';

@Injectable()
export class CollectionRecordsService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly relationsService: CollectionRelationsService,
  ) {}

  async getCollectionRecords(
    collection: CollectionFields,
    includeRelations: boolean = false,
  ): Promise<any[]> {
    let query = this.knex(`cm_${collection.slug}`).select('*');

    if (includeRelations) {
      const relationFields = collection.fields.filter(
        (field) => field.type === 'relation',
      );

      for (const field of relationFields) {
        if (!field.relation) continue;

        const relationTableName = `cm_rel_${collection.slug}_${field.relation.target}_${field.name}`;
        const targetTableName = `cm_${field.relation.target}`;

        query = query
          .leftJoin(
            relationTableName,
            `cm_${collection.slug}.documentId`,
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
          .groupBy(`cm_${collection.slug}.documentId`);
      }
    }

    return query;
  }

  async getCollectionRecord(
    collection: CollectionFields,
    documentId: string,
    includeRelations: boolean = false,
  ): Promise<any> {
    let query = this.knex(`cm_${collection.slug}`).where(
      `cm_${collection.slug}.documentId`,
      documentId,
    );

    if (includeRelations) {
      const relationFields = collection.fields.filter(
        (field) => field.type === 'relation',
      );

      for (const field of relationFields) {
        if (!field.relation) continue;

        const relationTableName = `cm_rel_${collection.slug}_${field.relation.target}_${field.name}`;
        const targetTableName = `cm_${field.relation.target}`;

        query = query
          .leftJoin(
            relationTableName,
            `cm_${collection.slug}.documentId`,
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

    const record = await query.first();

    if (!record) {
      throw new CollectionRecordNotFoundException(documentId, collection.slug);
    }

    return record;
  }

  async createCollectionRecord(
    collection: CollectionFields,
    dto: { data: any; relations?: Record<string, string[]> },
  ): Promise<any> {
    return this.knex.transaction(async (trx) => {
      // Validate required fields
      for (const field of collection.fields) {
        if (
          field.type !== 'relation' &&
          field.required &&
          !dto.data[field.name]
        ) {
          throw new CollectionFieldValidationException(
            `Field "${field.name}" is required`,
            { field },
          );
        }

        // Check unique constraints
        if (field.unique && dto.data[field.name]) {
          const exists = await trx(`cm_${collection.slug}`)
            .where(field.name, dto.data[field.name])
            .first();

          if (exists) {
            throw new DuplicateFieldValueException(
              field.name,
              dto.data[field.name],
            );
          }
        }
      }

      // Create main record
      const documentId = this.generateUuid();
      const [record] = await trx(`cm_${collection.slug}`)
        .insert({
          ...dto.data,
          documentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning('*');

      // Handle relations if provided
      if (dto.relations) {
        for (const [fieldName, targetIds] of Object.entries(dto.relations)) {
          const field = collection.fields.find((f) => f.name === fieldName);
          if (!field || field.type !== 'relation' || !field.relation) {
            continue;
          }

          const relationTableName = `cm_rel_${collection.slug}_${field.relation.target}_${fieldName}`;

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
  }

  async updateCollectionRecord(
    collection: CollectionFields,
    documentId: string,
    dto: { data: any; relations?: Record<string, string[]> },
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
        if (field.unique && dto.data[field.name]) {
          const exists = await trx(`cm_${collection.slug}`)
            .where(field.name, dto.data[field.name])
            .whereNot('documentId', documentId)
            .first();

          if (exists) {
            throw new DuplicateFieldValueException(
              field.name,
              dto.data[field.name],
            );
          }
        }
      }

      // Update main record
      const [updated] = await trx(`cm_${collection.slug}`)
        .where('documentId', documentId)
        .update({
          ...dto.data,
          updatedAt: new Date(),
        })
        .returning('*');

      // Handle relations if provided
      if (dto.relations) {
        for (const [fieldName, targetIds] of Object.entries(dto.relations)) {
          const field = collection.fields.find((f) => f.name === fieldName);
          if (!field || field.type !== 'relation' || !field.relation) {
            continue;
          }

          const relationTableName = `cm_rel_${collection.slug}_${field.relation.target}_${fieldName}`;

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
  }

  async deleteCollectionRecord(
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

  private generateUuid(): string {
    return uuidv4();
  }
}
