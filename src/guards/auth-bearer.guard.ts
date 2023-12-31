import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserQueryRepository } from '../repositories/user-query.repository';

@Injectable()
export class AuthBearerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    protected queryUsersRepository: UserQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      throw new UnauthorizedException('Token not found');
    }

    const accessToken = req.headers.authorization.split(' ')[1];
    const tokenPayload: any = await this.jwtService.decode(accessToken);
    if (!tokenPayload) {
      throw new UnauthorizedException('Wrong token');
    }
    const userExist = await this.queryUsersRepository.getUserById(
      tokenPayload.id,
    );
    if (!userExist) {
      throw new UnauthorizedException("User doesn't exist");
    }
    if (userExist.id !== tokenPayload.id) {
      throw new UnauthorizedException("Incorrect user's id");
    }
    if (!userExist.isUserConfirmed) {
      throw new UnauthorizedException('User not confirmed');
    }
    req.userId = tokenPayload.id;
    req.token = tokenPayload;
    return true;
  }
}
