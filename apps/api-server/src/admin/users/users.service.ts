import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AuthProvider, UserFields, UserModel } from './models/User.model';
import { CrudService } from '@api-server/database/crud.service';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';

@Injectable()
export class AdminUsersService
  extends CrudService<UserFields>
  implements OnModuleInit
{
  private userModel: UserModel;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    super();
  }

  onModuleInit() {
    this.userModel = new UserModel({
      tableName: 'users',
      knex: this.knex,
    });
    this.setModel(this.userModel);
  }

  async findAll(): Promise<UserFields[]> {
    return this.userModel.findAll();
  }

  async findOne(identifier: string): Promise<UserFields | null> {
    return this.userModel.findByIdentifier(identifier);
  }

  async findByEmail(email: string): Promise<UserFields | null> {
    return this.userModel.findByEmail(email);
  }

  async findByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<UserFields | null> {
    return this.userModel.findByProvider(provider, providerId);
  }

  async createUser(userData: Partial<UserFields>): Promise<UserFields> {
    const { roleDocumentIds, ...userDataWithoutRoles } =
      userData as Partial<UserFields> & { roleDocumentIds?: string[] };

    if (userDataWithoutRoles.password) {
      userDataWithoutRoles.password = await this.hashPassword(
        userDataWithoutRoles.password,
      );
    }

    const user = await this.create(userDataWithoutRoles);

    if (roleDocumentIds?.length) {
      const roles = await this.knex('roles')
        .whereIn('documentId', roleDocumentIds)
        .select('id');

      await Promise.all(
        roles.map((role) =>
          this.knex('user_roles').insert({
            userId: user.id,
            roleId: role.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      );

      return this.findById(user.id);
    }

    return user;
  }

  async update(id: number, userData: Partial<UserFields>): Promise<UserFields> {
    const { roleDocumentIds, ...userDataWithoutRoles } =
      userData as Partial<UserFields> & { roleDocumentIds?: string[] };

    if (userDataWithoutRoles.password) {
      userDataWithoutRoles.password = await this.hashPassword(
        userDataWithoutRoles.password,
      );
    }

    if (roleDocumentIds?.length) {
      const roles = await this.knex('roles')
        .whereIn('documentId', roleDocumentIds)
        .select('id');

      await this.knex('user_roles').where('userId', id).delete();

      await Promise.all(
        roles.map((role) =>
          this.knex('user_roles').insert({
            userId: id,
            roleId: role.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      );
    }

    return super.update(id, userDataWithoutRoles);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
