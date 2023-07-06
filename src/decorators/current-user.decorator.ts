import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.userId) {
      return null;
    }

    return request.userId;
  },
);
