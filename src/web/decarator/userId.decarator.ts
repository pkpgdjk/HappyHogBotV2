import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

export const UserId = createParamDecorator(async (data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  return req.session.get('userId');
});