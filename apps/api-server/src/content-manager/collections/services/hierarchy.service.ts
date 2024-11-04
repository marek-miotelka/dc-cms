import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { CollectionFields } from '../models/Collection.model';
import { CollectionNotFoundException } from '../exceptions/collection.exceptions';

@Injectable()
export class CollectionHierarchyService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async getCollectionHierarchy(): Promise<CollectionFields[]> {
    // Get all root collections (those without parents)
    const rootCollections = await this.knex('collections')
      .whereNull('parentId')
      .orderBy('name');

    // Build the complete hierarchy
    const hierarchy = await Promise.all(
      rootCollections.map((collection) =>
        this.buildCollectionTree(collection.id),
      ),
    );

    return hierarchy;
  }

  async getSubcollections(parentId: number): Promise<CollectionFields[]> {
    const subcollections = await this.knex('collections')
      .where('parentId', parentId)
      .orderBy('name');

    return subcollections;
  }

  async moveCollection(
    collectionId: number,
    newParentId: number | null,
  ): Promise<void> {
    const collection = await this.knex('collections')
      .where('id', collectionId)
      .first();

    if (!collection) {
      throw new CollectionNotFoundException(collectionId.toString());
    }

    if (newParentId) {
      const parent = await this.knex('collections')
        .where('id', newParentId)
        .first();

      if (!parent) {
        throw new CollectionNotFoundException(newParentId.toString());
      }

      // Check for circular reference
      if (await this.wouldCreateCircularReference(collectionId, newParentId)) {
        throw new Error(
          'Moving this collection would create a circular reference',
        );
      }
    }

    await this.knex('collections')
      .where('id', collectionId)
      .update({ parentId: newParentId });
  }

  private async buildCollectionTree(
    rootId: number,
  ): Promise<CollectionFields & { children: CollectionFields[] }> {
    const root = await this.knex('collections').where('id', rootId).first();
    if (!root) {
      throw new CollectionNotFoundException(rootId.toString());
    }

    const children = await this.getSubcollections(rootId);
    const childTrees = await Promise.all(
      children.map((child) => this.buildCollectionTree(child.id)),
    );

    return {
      ...root,
      children: childTrees,
    };
  }

  private async wouldCreateCircularReference(
    collectionId: number,
    newParentId: number,
  ): Promise<boolean> {
    let currentId = newParentId;
    const visited = new Set<number>();

    while (currentId) {
      if (currentId === collectionId) {
        return true;
      }

      if (visited.has(currentId)) {
        return true;
      }

      visited.add(currentId);

      const parent = await this.knex('collections')
        .where('id', currentId)
        .select('parentId')
        .first();

      if (!parent) {
        break;
      }

      currentId = parent.parentId;
    }

    return false;
  }

  async validateHierarchicalSlug(
    parentId: number | null,
    slug: string,
  ): Promise<string> {
    if (!parentId) {
      return slug;
    }

    const parent = await this.knex('collections').where('id', parentId).first();

    if (!parent) {
      throw new CollectionNotFoundException(parentId.toString());
    }

    // Construct hierarchical slug
    return `${parent.slug}/${slug}`;
  }
}
