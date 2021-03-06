import { Account } from './../../entities/account.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotService } from '../../bot/services/bot/bot.service';
import { LogService } from '../../log/log/log.service';
import { LoginException } from '../../exception/bot/login.exception';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    private botService: BotService,
    private logService: LogService,
  ) {}

  @Interval(8 * 60 * 1000)
  // @Timeout(1000)
  public async feedFood(accounts?: Account[]) {
    if (!accounts) {
      accounts = await this.accountsRepository.find({
        where: {
          status: true,
        },
      });
    }
    for (let i = 0; i < accounts.length; i++) {
      let account = accounts[i];
      try {
        this.logService.log('---- เริ่มการดูแลหมู ----', account);
        account = await this.botService.loginIntoAccount(account);
        if (account.loginStatus) {
          await this.botService.checkFood(account);
        } else {
          this.logService.log('login ไม่ผาน', account);
          throw new LoginException("can't not login with fbToken");
        }
      } catch (error) {
        if (error instanceof LoginException) {
          account.loginStatus = false;
        }

        if (error instanceof Error) {
          this.logService.log(error.message, account);
        }
      } finally {
        this.logService.log('---- การดูแลหมูเสร็จสิ้น ----', account);
        this.accountsRepository.save(account);
      }
    }
  }

  @Cron('0 */2 * * *')
  // @Timeout(1000)
  public async doDiaryMission(accounts?: Account[]) {
    if (!accounts) {
      accounts = await this.accountsRepository.find({
        where: {
          status: true,
        },
      });
    }
    for (let i = 0; i < accounts.length; i++) {
      let account = accounts[i];
      try {
        this.logService.log('---- เริ่มการทำภารกิจรายวัน ----', account);

        account = await this.botService.loginIntoAccount(account);
        if (account.loginStatus) {
          await this.botService.checkDiaryMission(account);
        } else {
          this.logService.log('login ไม่ผาน', account);
          throw new LoginException("can't not login with fbToken");
        }
      } catch (error) {
        console.log(error);
        if (error instanceof LoginException) {
          account.loginStatus = false;
        }

        if (error instanceof Error) {
          this.logService.log(error.message, account);
        }
      } finally {
        this.logService.log('---- จบการทำภารกิจรายวัน ----', account);
        this.accountsRepository.save(account);
      }
    }
  }

  @Cron('0 */4 * * *')
  // @Timeout(1000)
  public async diaryCheckIn(accounts?: Account[]) {
    if (!accounts) {
      accounts = await this.accountsRepository.find({
        where: {
          status: true,
        },
      });
    }
    for (let i = 0; i < accounts.length; i++) {
      let account = accounts[i];
      try {
        this.logService.log('---- เริ่มการเช็คอินรายวัน ----', account);
        account = await this.botService.loginIntoAccount(account);
        if (account.loginStatus) {
          await this.botService.dailyCheckIn(account);
        } else {
          this.logService.log('login ไม่ผาน', account);
          throw new LoginException("can't not login with fbToken");
        }
      } catch (error) {
        console.log(error);
        if (error instanceof LoginException) {
          account.loginStatus = false;
        }

        if (error instanceof Error) {
          this.logService.log(error.message, account);
        }
      } finally {
        this.logService.log('---- จบการเช็คอินรายวัน ----', account);
        this.accountsRepository.save(account);
      }
    }
  }
}
