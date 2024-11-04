import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  CollectionField,
  CollectionFields,
  RelationType,
} from '../models/Collection.model';
import { CollectionFieldValidationException } from '../exceptions/collection.exceptions';

type RelationField = CollectionField & {
  relation: NonNullable<CollectionField['relation']>;
};

@Injectable()
export class CollectionRelationsService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async createRelationTable(
    sourceCollection: CollectionFields,
    field: RelationField,
  ): Promise<void> {
    const relationTableName = this.getRelationTableName(
      sourceCollection.slug,
      field.name,
    );

    // Create the relation table if it doesn't exist
    if (!(await this.knex.schema.hasTable(relationTableName))) {
      await this.knex.schema.createTable(relationTableName, (table) => {
        if (field.relation.type === 'oneToOne') {
          table.uuid('sourceId').primary();
          table.uuid('targetId').unique();
        } else {
          table.increments('id').primary();
          table.uuid('sourceId');
          table.uuid('targetId');
          table.unique(['sourceId', 'targetId']);
        }

        table
          .timestamp('createdAt')
          .notNullable()
          .defaultTo(this.knex.fn.now());
        table
          .timestamp('updatedAt')
          .notNullable()
          .defaultTo(this.knex.fn.now());

        // Add foreign key constraints
        table
          .foreign('sourceId')
          .references('documentId')
          .inTable(`cm_${sourceCollection.slug}`)
          .onDelete('CASCADE');

        table
          .foreign('targetId')
          .references('documentId')
          .inTable(`cm_${field.relation.target}`)
          .onDelete('CASCADE');
      });
    }
  }

  async dropRelationTable(
    collectionSlug: string,
    fieldName: string,
  ): Promise<void> {
    const relationTableName = this.getRelationTableName(
      collectionSlug,
      fieldName,
    );
    if (await this.knex.schema.hasTable(relationTableName)) {
      await this.knex.schema.dropTable(relationTableName);
    }
  }

  async validateRelation(
    field: CollectionField,
    targetCollection: CollectionFields,
  ): Promise<void> {
    if (!field.relation) {
      throw new CollectionFieldValidationException(
        'Relation configuration is required for relation fields',
        { field },
      );
    }

    await this.validateBidirectionalRelation(field, targetCollection);
  }

  async getRelatedRecords(
    collectionSlug: string,
    fieldName: string,
    sourceId: string,
    type: RelationType,
  ): Promise<any[]> {
    const relationTableName = this.getRelationTableName(
      collectionSlug,
      fieldName,
    );

    const query = this.knex(relationTableName)
      .where('sourceId', sourceId)
      .select('targetId');

    if (type === 'oneToOne') {
      return query.first();
    }

    return query;
  }

  async createRelation(
    collectionSlug: string,
    fieldName: string,
    sourceId: string,
    targetId: string,
    type: RelationType,
  ): Promise<void> {
    const relationTableName = this.getRelationTableName(
      collectionSlug,
      fieldName,
    );

    if (type === 'oneToOne') {
      // Check if relation already exists
      const existing = await this.knex(relationTableName)
        .where('sourceId', sourceId)
        .orWhere('targetId', targetId)
        .first();

      if (existing) {
        throw new Error('One-to-one relation already exists');
      }
    }

    await this.knex(relationTableName).insert({
      sourceId,
      targetId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async deleteRelation(
    collectionSlug: string,
    fieldName: string,
    sourceId: string,
    targetId: string,
  ): Promise<void> {
    const relationTableName = this.getRelationTableName(
      collectionSlug,
      fieldName,
    );
    await this.knex(relationTableName).where({ sourceId, targetId }).delete();
  }

  private getRelationTableName(
    collectionSlug: string,
    fieldName: string,
  ): string {
    return `cm_rel_${collectionSlug}_${fieldName}`;
  }

  private async validateBidirectionalRelation(
    field: CollectionField,
    targetCollection: CollectionFields,
  ): Promise<void> {
    if (!field.relation) {
      return;
    }

    if (!field.relation.bidirectional) {
      return;
    }

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
