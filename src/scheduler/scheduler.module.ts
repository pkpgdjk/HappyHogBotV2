import { UtilityService } from './../utility/utility/utility.service';
import { UtilityModule } from './../utility/utility.module';
import { GameService } from './../bot/services/game/game.service';
import { FacebookService } from './../bot/services/facebook/facebook.service';
import { LogService } from './../log/log/log.service';
import { LogModule } from './../log/log.module';
import { BotModule } from './../bot/bot.module';
import { Log } from './../entities/log.entity';
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler/scheduler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { BotService } from './../bot/services/bot/bot.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Log]),
    BotModule, 
    LogModule,
    UtilityModule
  ],
  providers: [SchedulerService]
})
export class SchedulerModule {}
