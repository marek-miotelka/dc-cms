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

  /**
   * Retrieves all users from the database
   * @returns Promise resolving to an array of users
   */
  async findAll(): Promise<UserFields[]> {
    return this.userModel.findAll();
  }

  /**
   * Find user by email or username
   * @param identifier - Email or username to search for
   * @returns Promise resolving to user if found, null otherwise
   */
  async findOne(identifier: string): Promise<UserFields | null> {
    return this.userModel.findByIdentifier(identifier);
  }

  /**
   * Find user by email address
   * @param email - Email to search for
   * @returns Promise resolving to user if found, null otherwise
   */
  async findByEmail(email: string): Promise<UserFields | null> {
    return this.userModel.findByEmail(email);
  }

  /**
   * Find user by authentication provider
   * @param provider - Authentication provider (e.g., 'google')
   * @param providerId - Provider-specific user ID
   * @returns Promise resolving to user if found, null otherwise
   */
  async findByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<UserFields | null> {
    return this.userModel.findByProvider(provider, providerId);
  }

  /**
   * Create new user with password hashing if provided
   * @param userData - User data to create
   * @returns Promise resolving to created user
   */
  async createUser(userData: Partial<UserFields>): Promise<UserFields> {
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    return this.create(userData);
  }

  /**
   * Validate password against stored hash
   * @param plainPassword - Password to validate
   * @param hashedPassword - Stored password hash
   * @returns Promise resolving to boolean indicating if password is valid
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Hash password for storage
   * @param password - Plain text password to hash
   * @returns Promise resolving to hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
