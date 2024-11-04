import { BaseModel, BaseModelFields } from '@api-server/database/base.model';

export type AuthProvider = 'google' | 'github' | 'facebook';

export interface UserFields extends BaseModelFields {
  email: string;
  username: string;
  name: string;
  lastname: string;
  password?: string;
  providerIds?: Partial<Record<AuthProvider, string>>;
}

export class UserModel extends BaseModel {
  /**
   * Retrieves all users from the database
   * @returns Promise resolving to an array of UserFields
   */
  async findAll(): Promise<UserFields[]> {
    return this.knex(this.tableName).select('*');
  }

  /**
   * Find user by email or username
   * @param identifier - Email or username to search for
   * @returns Promise resolving to user if found, null otherwise
   */
  async findByIdentifier(identifier: string): Promise<UserFields | null> {
    return this.knex(this.tableName)
      .where('email', identifier)
      .orWhere('username', identifier)
      .first();
  }

  /**
   * Find user by email address
   * @param email - Email to search for
   * @returns Promise resolving to user if found, null otherwise
   */
  async findByEmail(email: string): Promise<UserFields | null> {
    return this.knex(this.tableName).where('email', email).first();
  }

  /**
   * Find user by username
   * @param username - Username to search for
   * @returns Promise resolving to user if found, null otherwise
   */
  async findByUsername(username: string): Promise<UserFields | null> {
    return this.knex(this.tableName).where('username', username).first();
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
    return this.knex(this.tableName)
      .whereRaw('provider_ids->>? = ?', [provider, providerId])
      .first();
  }
}
