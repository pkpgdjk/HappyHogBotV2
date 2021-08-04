import { LogType } from './../../enum/log-type.enum';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { Log } from '../../entities/log.entity';
import * as dayjs from 'dayjs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LogService {
  private logs: Log[] = [];
  private lastSaved: dayjs.Dayjs = dayjs(0);

  constructor(
    @InjectRepository(Log)
    private logsRepository: Repository<Log>,
  ) {}
  public log(msg: string, account: Account) {
    const date = dayjs.tz(new Date());
    const log = new Log();
    log.message = msg;
    log.account = account;
    log.createdAt = date.toDate();
    this.pushLog(log);
    console.log(`[${account.name}]`, date.format('DD/MM/YYYY HH:mm:ss'), msg);
  }

  public alert(msg: string, account: Account) {
    const date = dayjs.tz(new Date());
    const log = new Log();
    log.message = msg;
    log.type = LogType.ALERT;
    log.account = account;
    log.createdAt = date.toDate();
    this.pushLog(log);
    console.warn(`[${account.name}]`, date.format('DD/MM/YYYY HH:mm:ss'), msg);
  }

  private pushLog(log: Log) {
    this.logs.push(log);
    if (this.logs.length >= 5 || this.lastSaved.add(30, 'seconds') < dayjs()) {
      this.logsRepository.save(this.logs);
      console.log(`pushed ${this.logs.length} logs`);
      this.lastSaved = dayjs();
      this.logs = [];
    }
  }

  public async save() {
    this.logsRepository.save(this.logs);
    this.lastSaved = dayjs();
    this.logs = [];
  }
}
