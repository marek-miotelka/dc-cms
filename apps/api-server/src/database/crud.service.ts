import { BaseModel, BaseModelFields } from './base.model';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CrudService<T extends BaseModelFields> {
  protected model: BaseModel;

  setModel(model: BaseModel) {
    this.model = model;
  }

  async findById(id: number): Promise<T> {
    const result = await this.model.findById<T>(id);
    if (!result) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return result;
  }

  async findByDocumentId(documentId: string): Promise<T> {
    const result = await this.model.findByDocumentId<T>(documentId);
    if (!result) {
      throw new NotFoundException(
        `Entity with documentId ${documentId} not found`,
      );
    }
    return result;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const result = await this.model.create<T>(data);
      if (!result) {
        throw new Error('Failed to create entity');
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to create entity: ${error.message}`);
    }
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    try {
      // Check if entity exists
      await this.findById(id);

      const result = await this.model.update<T>(id, data);
      if (!result) {
        throw new Error('Failed to update entity');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update entity: ${error.message}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      // Check if entity exists
      await this.findById(id);

      const deleted = await this.model.delete(id);
      if (!deleted) {
        throw new Error('Failed to delete entity');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete entity: ${error.message}`);
    }
  }
}
