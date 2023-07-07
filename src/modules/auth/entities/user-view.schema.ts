import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class ViewUser {
  @ApiProperty({ description: 'UUID' })
  id: string;

  @ApiProperty({ example: 'somemail@mail.com' })
  email: string;

  @ApiProperty({ example: new Date().toISOString() })
  createdAt: string;

  static async create(user: User) {
    const viewUser = new ViewUser();
    viewUser.id = user.id;
    viewUser.email = user.email;
    viewUser.createdAt = user.createdAt;
    return viewUser;
  }
}
