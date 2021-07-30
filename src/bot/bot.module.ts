import { LogService } from './../log/log/log.service';
import { Log } from './../entities/log.entity';
import { Account } from './../entities/account.entity';
import { Module } from '@nestjs/common';
import { UtilityModule } from 'src/utility/utility.module';
import { BotService } from './services/bot/bot.service';
import { GameService } from './services/game/game.service';
import { FacebookService } from './services/facebook/facebook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UtilityService } from '../utility/utility/utility.service';
import { HttpModule } from '@nestjs/axios';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Log]), 
    UtilityModule,
    HttpModule.register({
      timeout: 15000,
    }),
    LogModule,
  ],
  providers: [GameService, BotService, FacebookService],
  exports: [GameService, BotService, FacebookService]
})
export class BotModule {}
