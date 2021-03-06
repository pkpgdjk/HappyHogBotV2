import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebModule } from './web/web.module';
import { BotModule } from './bot/bot.module';
import { GameService } from './bot/services/game/game.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogModule } from './log/log.module';
import { SpinModule } from './spin/spin.module';
import { UtilityModule } from './utility/utility.module';
import database from './config/database';
import { BotService } from './bot/services/bot/bot.service';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilityService } from './utility/utility/utility.service';
import { LogService } from './log/log/log.service';
import { FacebookService } from './bot/services/facebook/facebook.service';
import { AuthMiddleware, logger } from './web/middlewares/auth.middleware';
import { WebService } from './web/services/web/web.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    HttpModule.register({
      timeout: 15000,
    }),
    TypeOrmModule.forRoot(
      database()
    ),
    ScheduleModule.forRoot(),
    WebModule, 
    BotModule, LogModule, SpinModule, UtilityModule, SchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes("web");
  }
}
