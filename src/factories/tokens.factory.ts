import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { settings } from '../../config/settings';
import { Tokens } from './tokens.enum';
import { PairTokenResponse } from '../modules/auth/dto/response-dto/pair-token.response';

@Injectable()
export class TokensFactory {
  constructor(private jwtService: JwtService) {}

  async getPairTokens(userId: string): Promise<PairTokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(Tokens.AccessToken, userId),
      this.generateToken(Tokens.RefreshToken, userId),
    ]);
    return { accessToken, refreshToken };
  }

  private generateToken(tokenType: Tokens, userId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        id: userId,
      },
      {
        secret: settings.secret[tokenType],
        expiresIn: settings.timeLife[tokenType],
      },
    );
  }
}
