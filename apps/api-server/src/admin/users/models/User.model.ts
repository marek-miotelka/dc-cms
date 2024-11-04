import { BaseModel, BaseModelFields } from '@api-server/database/base.model';
import { RoleFields } from '@api-server/admin/roles/models/Role.model';

export type AuthProvider = 'google' | 'github' | 'facebook';

export interface UserFields extends BaseModelFields {
  email: string;
  username: string;
  name: string;
  lastname: string;
  password?: string;
  providerIds?: Partial<Record<AuthProvider, string>>;
  roles?: RoleFields[];
}

export type SanitizedUser = Omit<UserFields, 'password'>;

export class UserModel extends BaseModel<UserFields> {
  static sanitize(user: UserFields): SanitizedUser {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async findAll(): Promise<UserFields[]> {
    const users = await this.knex(this.tableName)
      .select(`${this.tableName}.*`)
      .leftJoin('user_roles', `${this.tableName}.id`, 'user_roles.userId')
      .leftJoin('roles', 'user_roles.roleId', 'roles.id')
      .groupBy(`${this.tableName}.id`)
      .then((users) => this.attachRoles(users));

    return users;
  }

  async findByIdentifier(identifier: string): Promise<UserFields | null> {
    const user = await this.knex(this.tableName)
      .where('email', identifier)
      .orWhere('username', identifier)
      .first();

    if (user) {
      user.roles = await this.getRoles(user.id);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserFields | null> {
    const user = await this.knex(this.tableName).where('email', email).first();

    if (user) {
      user.roles = await this.getRoles(user.id);
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserFields | null> {
    const user = await this.knex(this.tableName)
      .where('username', username)
      .first();

    if (user) {
      user.roles = await this.getRoles(user.id);
    }

    return user;
  }

  async findByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<UserFields | null> {
    const user = await this.knex(this.tableName)
      .whereRaw('provider_ids->>? = ?', [provider, providerId])
      .first();

    if (user) {
      user.roles = await this.getRoles(user.id);
    }

    return user;
  }

  override async findById(id: number): Promise<UserFields | null> {
    const user = await super.findById(id);

    if (user) {
      user.roles = await this.getRoles(user.id);
    }

    return user;
  }

  override async findByDocumentId(
    documentId: string,
  ): Promise<UserFields | null> {
    const user = await super.findByDocumentId(documentId);

    if (user) {
      user.roles = await this.getRoles(user.id);
    }

    return user;
  }

  private async getRoles(userId: number): Promise<RoleFields[]> {
    return this.knex('roles')
      .select('roles.*')
      .join('user_roles', 'roles.id', 'user_roles.roleId')
      .where('user_roles.userId', userId);
  }

  private async attachRoles(users: UserFields[]): Promise<UserFields[]> {
    const userIds = users.map((user) => user.id);

    const rolesByUserId = await this.knex('roles')
      .select('roles.*', 'user_roles.userId')
      .join('user_roles', 'roles.id', 'user_roles.roleId')
      .whereIn('user_roles.userId', userIds)
      .then((rows) => {
        return rows.reduce(
          (acc, row) => {
            const { userId, ...role } = row;
            acc[userId] = acc[userId] || [];
            acc[userId].push(role);
            return acc;
          },
          {} as Record<number, RoleFields[]>,
        );
      });

    return users.map((user) => ({
      ...user,
      roles: rolesByUserId[user.id] || [],
    }));
  }
}
