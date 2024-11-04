import { BaseModel, BaseModelFields } from '@api-server/database/base.model';

export interface RoleFields extends BaseModelFields {
  name: string;
  description: string;
  permissions: string[];
}

export type SanitizedRole = RoleFields;

export class RoleModel extends BaseModel<RoleFields> {
  static sanitize(role: RoleFields): SanitizedRole {
    return role;
  }

  async findAll(): Promise<RoleFields[]> {
    return this.knex(this.tableName).select('*');
  }

  async findByName(name: string): Promise<RoleFields | null> {
    return this.knex(this.tableName).where('name', name).first();
  }

  async findByUserId(userId: number): Promise<RoleFields[]> {
    return this.knex(this.tableName)
      .select('roles.*')
      .join('user_roles', 'roles.id', 'user_roles.roleId')
      .where('user_roles.userId', userId);
  }
}
