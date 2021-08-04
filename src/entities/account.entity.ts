import { AccountDto } from './../web/dto/account.dto';
import { User } from './user.entity';
import { IAccountSettings } from "../interface/account-settings.interface";
import {Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, ManyToOne, OneToMany} from "typeorm";
import { IAccountUserData } from '../interface/account-user-data.interface';
import { Log } from './log.entity';
import * as dayjs from 'dayjs'

@Entity()
export class Account {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({type: 'text'})
    fbCookie: string;

    @Column({type: 'text', nullable: true})
    fbToken?: string;

    @Column({type: 'text', nullable: true})
    gameCookie?: string;
    
    @Column({type: 'text'})
    settings: string;

    @Column({type: 'text', nullable: true})
    userData?: string;

    @Column({type: 'text', nullable: true})
    missions?: string;

    @Column({type: 'datetime', default: () => "now()"})
    checkinAt: Date;

    @Column({type: 'datetime', default: () => "now()"})
    missionCompletedAt: Date;

    @Column({ default: true})
    status: boolean;

    @Column({ default: true})
    loginStatus: boolean;

    @OneToMany(() => Log, log => log.account)
    logs: Log[];

    @ManyToOne(() => User, user => user.accounts)
    owner: User;

    getSettings(): IAccountSettings {
        return JSON.parse(this.settings)
    }

    getUserData(): IAccountUserData {
        return JSON.parse(this.userData)
    }

    get isCheckedIn(): boolean {
        const today = dayjs.tz(new Date()).format("YYYY-MM-DD")
        const checkinAt = dayjs.tz(this.checkinAt).format("YYYY-MM-DD")
        return today == checkinAt
    }

    createFromAccountDto(accountDto: AccountDto, user: User): Account {
        let settings: IAccountSettings = {
                autoFarm: true,
                autoMission: true,
                speedMatingMission: true,
                autoBuyItem: true,
                sellGodPig: false,
                poisonFarm: '',
                foodId: 0,
                buyFoodId: 89,
        }

        let account = new Account();
        account.name = accountDto.name
        account.fbCookie = accountDto.fbCookie
        account.status = true
        account.missions = JSON.stringify([])
        account.settings = JSON.stringify(settings);
        account.owner = user
        account.checkinAt = new Date(0)
        account.missionCompletedAt = new Date(0)

        return account;
    }

}