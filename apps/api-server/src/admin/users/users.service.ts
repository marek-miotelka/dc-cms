import { Injectable } from '@nestjs/common';
import { AdminUser } from './models/User.model';
import * as bcrypt from 'bcrypt';

/**
 * Service managing user operations
 * Handles user storage, retrieval, and password management
 */
@Injectable()
export class AdminUsersService {
  // Temporary in-memory user storage
  private users: AdminUser[] = [
    {
      id: 1,
      username: 'john',
      email: 'john@distcode.com',
      password: '$2b$10$zGqGMPV8P.TQXZ0X0X0X0OqZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // Test1234#
    },
    {
      id: 2,
      username: 'maria',
      email: 'maria@distcode.com',
      password: '$2b$10$zGqGMPV8P.TQXZ0X0X0X0OqZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // Test1234#
    },
  ];

  /**
   * Find user by username or email
   * @param identifier - Username or email to search for
   */
  async findOne(identifier: string): Promise<AdminUser | undefined> {
    return this.users.find(
      (user) => user.username === identifier || user.email === identifier,
    );
  }

  /**
   * Find user by email address
   * @param email - Email to search for
   */
  async findByEmail(email: string): Promise<AdminUser | undefined> {
    return this.users.find((user) => user.email === email);
  }

  /**
   * Find user by Google ID
   * @param googleId - Google OAuth2 user ID
   */
  async findByGoogleId(googleId: string): Promise<AdminUser | undefined> {
    return this.users.find((user) => user.googleId === googleId);
  }

  /**
   * Create new user
   * @param userData - User data to create
   */
  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    const newUser: AdminUser = {
      id: this.users.length + 1,
      username: userData.username!,
      email: userData.email!,
      password: userData.password,
      googleId: userData.googleId,
      displayName: userData.displayName,
      photoUrl: userData.photoUrl,
    };
    
    this.users.push(newUser);
    return newUser;
  }

  /**
   * Validate password against stored hash
   * @param plainPassword - Password to validate
   * @param hashedPassword - Stored password hash
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Hash password for storage
   * @param password - Plain text password to hash
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}