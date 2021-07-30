import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { Log } from '../../entities/log.entity';
import * as dayjs from 'dayjs'
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LogService {
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
        this.logsRepository.save(log);
        console.log(date.format("DD/MM/YYYY HH:mm:ss"), msg);
    }
}
