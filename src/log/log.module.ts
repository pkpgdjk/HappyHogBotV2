import { Log } from './../entities/log.entity';
import { Account } from './../entities/account.entity';
import { User } from './../entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogService } from './log/log.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, Log])],
  providers: [LogService],
  exports: [LogService]
})
export class LogModule {}
