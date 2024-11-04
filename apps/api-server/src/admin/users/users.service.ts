import { Injectable } from '@nestjs/common';
import { AdminUser } from '@api-server/admin/users/models/User.model';

@Injectable()
export class AdminUsersService {
  private readonly users: AdminUser[] = [
    {
      id: 1,
      username: 'john', // can be email or username
      email: 'john@distcode.com',
      password: 'Test1234#',
    },
    {
      id: 2,
      username: 'maria', // can be email or username
      email: 'maria@distcode.com',
      password: 'Test1234#',
    },
  ];

  async findOne(identifier: string): Promise<AdminUser | undefined> {
    return this.users.find(
      (user) => user.username === identifier || user.email === identifier,
    );
  }
}
