import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RoleFields, RoleModel } from './models/Role.model';
import { CrudService } from '@api-server/database/crud.service';
import { Knex } from 'knex';

@Injectable()
export class AdminRolesService
  extends CrudService<RoleFields>
  implements OnModuleInit
{
  private roleModel: RoleModel;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    super();
  }

  onModuleInit() {
    this.roleModel = new RoleModel({
      tableName: 'roles',
      knex: this.knex,
    });
    this.setModel(this.roleModel);
  }

  async findAll(): Promise<RoleFields[]> {
    return this.roleModel.findAll();
  }

  async findByName(name: string): Promise<RoleFields | null> {
    return this.roleModel.findByName(name);
  }

  async findByUserId(userId: number): Promise<RoleFields[]> {
    return this.roleModel.findByUserId(userId);
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    await this.knex('user_roles').insert({
      userId,
      roleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await this.knex('user_roles').where({ userId, roleId }).delete();
  }
}
