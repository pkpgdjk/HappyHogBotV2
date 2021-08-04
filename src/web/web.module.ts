import { BotModule } from './../bot/bot.module';
import { SchedulerModule } from './../scheduler/scheduler.module';
import { UtilityModule } from './../utility/utility.module';
import { AuthMiddleware, logger } from './middlewares/auth.middleware';
import { Log } from './../entities/log.entity';
import { Account } from './../entities/account.entity';
import { User } from './../entities/user.entity';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { WebService } from './services/web/web.service';
import { WebController } from './controllers/web.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, Log]), UtilityModule, SchedulerModule, BotModule],
  providers: [WebService],
  controllers: [WebController],
  exports: [WebService]
})
export class WebModule {}
