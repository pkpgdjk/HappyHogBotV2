import { SchedulerService } from './../../../scheduler/scheduler/scheduler.service';
import { Log } from './../../../entities/log.entity';
import { Account } from './../../../entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './../../../entities/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountDto } from '../../../web/dto/account.dto';
import { SettingDto } from '../../../web/dto/setting.dto';
import { IAccountSettings } from '../../../interface/account-settings.interface';
import { UtilityService } from '../../../utility/utility/utility.service';
import { FoodId } from '../../../enum/food.enum';
import { BotService } from '../../../bot/services/bot/bot.service';

@Injectable()
export class WebService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Log)
    private logsRepository: Repository<Log>,
    private utilityService: UtilityService,
    private schedulerService: SchedulerService,
    private botService: BotService,
  ) {}
  public async login(username: string, password: string): Promise<User> {
    let user = await this.usersRepository.findOne({
      username: username,
      password: password,
      isActive: true,
    });
    return user;
  }

  public async createUser(user: User): Promise<void> {}

  public async getUserById(userId: string): Promise<User> {
    let user = await this.usersRepository.createQueryBuilder('user').leftJoinAndSelect('user.accounts', 'accounts').orderBy('accounts.createdAt').getOne();
    return user;
  }

  public async createOrUpdateAccount(accountDto: AccountDto, userId: string): Promise<Account> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (!user) {
      throw new HttpException(`can't find user by userId: ${userId}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let account: Account;
    if (accountDto.accountId) {
      account = await this.accountsRepository.findOne({
        id: accountDto.accountId,
        owner: {
          id: userId,
        },
      });

      account.fbCookie = accountDto.fbCookie;
      account.name = accountDto.name;
    } else {
      account = new Account().createFromAccountDto(accountDto, user);
    }

    account = await this.botService.loginIntoAccount(account);
    await this.accountsRepository.save(account);

    (async () => {
      await this.schedulerService.doDiaryMission([account]);
    })();

    return account;
  }

  public async setting(settingDto: SettingDto, userId: string): Promise<Account> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (!user) {
      throw new HttpException(`can't find user by userId: ${userId}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const account = await this.accountsRepository.findOne({
      id: settingDto.accountId,
    });
    if (!account) {
      throw new HttpException(`can't find account by accountId: ${settingDto.accountId}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const coinItem = this.utilityService.getItemIdByFarmLevel(account.getUserData().farm.farmLevel);
    let buyFoodId = {
      [FoodId.FOOD_1]: coinItem.FOOD_1,
      [FoodId.FOOD_2]: coinItem.FOOD_2,
      [FoodId.FOOD_3]: coinItem.FOOD_3,
      [FoodId.FOOD_4]: coinItem.FOOD_4,
    }[settingDto.foodId || 0];

    let setting: IAccountSettings = {
      autoFarm: settingDto.autoFarm == 'on',
      autoMission: settingDto.autoMission == 'on',
      speedMatingMission: settingDto.speedMatingMission == 'on',
      autoBuyItem: settingDto.autoBuyItem == 'on',
      sellGodPig: settingDto.sellGodPig == 'on',
      poisonFarm: settingDto.poisonFarm,
      foodId: Number(settingDto.foodId),
      buyFoodId: Number(buyFoodId),
    };

    account.settings = JSON.stringify(setting);
    await this.accountsRepository.save(account);
    return account;
  }

  public async getLog(accountId: string): Promise<Log[]> {
    return this.logsRepository
      .createQueryBuilder('log')
      .leftJoin('log.account', 'account')
      .where('account.id = :accountId', { accountId })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  public async clearLog(accountId: string): Promise<any> {
    return await this.logsRepository.delete({
      account: {
        id: accountId,
      },
    });
  }

  public async deleteAccount(accountId: string): Promise<any> {
    let account = await this.accountsRepository.findOne({
      id: accountId,
    });
    await this.accountsRepository.remove(account);
  }

  public async updateStatus(accountId: string, status: boolean): Promise<any> {
    let account = await this.accountsRepository.findOne({
      id: accountId,
    });
    account.status = status;
    await this.accountsRepository.save(account);
  }

  public async checkFood(accountId: string): Promise<any> {
    let account = await this.accountsRepository.findOne({ id: accountId });
    if (!account) {
      throw new HttpException(`can't find account ${accountId}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    this.schedulerService.feedFood([account]);
  }

  public async checkMission(accountId: string): Promise<any> {
    let account = await this.accountsRepository.findOne({ id: accountId });
    if (!account) {
      throw new HttpException(`can't find account ${accountId}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    this.schedulerService.doDiaryMission([account]);
  }

  public async checkCheckIn(accountId: string): Promise<any> {
    let account = await this.accountsRepository.findOne({ id: accountId });
    if (!account) {
      throw new HttpException(`can't find account ${accountId}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    this.schedulerService.diaryCheckIn([account]);
  }
}
