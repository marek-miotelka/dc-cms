import { Injectable } from '@nestjs/common';
import {
  CollectionAlreadyExistsException,
  CollectionFieldValidationException,
  CollectionNotFoundException,
} from '../../exceptions/collection.exceptions';
import { CollectionModelService } from '@api-server/content-manager/collections/services/base/collection-model.service';
import { CollectionFields } from '@api-server/content-manager/collections/models/Collection.model';

@Injectable()
export class CollectionValidationService {
  constructor(private readonly modelService: CollectionModelService) {}

  async validateNewCollection(data: Partial<CollectionFields>): Promise<void> {
    if (!data.slug) {
      throw new CollectionFieldValidationException('Slug is required', {
        data,
      });
    }

    const existing = await this.modelService.findBySlug(data.slug);
    if (existing) {
      throw new CollectionAlreadyExistsException(data.slug);
    }

    await this.validateFields(data.fields || []);
  }

  async validateUpdateCollection(
    id: number,
    data: Partial<CollectionFields>,
  ): Promise<CollectionFields> {
    const existing = await this.modelService.findById(id);
    if (!existing) {
      throw new CollectionNotFoundException(id.toString());
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.modelService.findBySlug(data.slug);
      if (slugExists) {
        throw new CollectionAlreadyExistsException(data.slug);
      }
    }

    if (data.fields) {
      await this.validateFields(data.fields);
    }

    return existing;
  }

  async validateFields(fields: CollectionFields['fields']): Promise<void> {
    for (const field of fields) {
      if (field.type === 'relation') {
        await this.validateRelationField(field);
      }
    }
  }

  private async validateRelationField(field: any): Promise<void> {
    if (!field.relation) {
      throw new CollectionFieldValidationException(
        'Relation configuration is required for relation fields',
        { field },
      );
    }

    const targetCollection = await this.modelService.findBySlug(
      field.relation.target,
    );
    if (!targetCollection) {
      throw new CollectionFieldValidationException(
        `Target collection "${field.relation.target}" not found`,
        { field },
      );
    }

    if (field.relation.bidirectional) {
      await this.validateBidirectionalRelation(field, targetCollection);
    }
  }

  private async validateBidirectionalRelation(
    field: any,
    targetCollection: CollectionFields,
  ): Promise<void> {
    if (!field.relation.inverseSide) {
      throw new CollectionFieldValidationException(
        'Inverse side configuration is required for bidirectional relations',
        { field },
      );
    }

    const inverseField = targetCollection.fields.find(
      (f) => f.name === field.relation?.inverseSide?.field,
    );
    if (!inverseField) {
      throw new CollectionFieldValidationException(
        `Inverse field "${field.relation.inverseSide.field}" not found in target collection`,
        { field },
      );
    }

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
