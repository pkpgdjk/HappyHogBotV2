import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest, FastifyReply } from 'fastify';
import { WebService } from '../services/web/web.service';
import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly webService: WebService
  ) {}

  
  async use(request, res, next: NextFunction) {
    let userId = request.session.get('userId')
    if (userId){
      let user = await this.webService.getUserById(userId);
      if (user){
        request.user = user
        next();
      }
    }
    res.redirect(302, '/web/login')
  }
}

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};