import { User } from './user.entity';
import { IAccountSettings } from "../interface/account-settings.interface";
import {Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, ManyToOne, OneToMany} from "typeorm";
import { IAccountUserData } from '../interface/account-user-data.interface';
import { Log } from './log.entity';

@Entity()
export class Account {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({type: 'text'})
    fbCookie: string;

    @Column({type: 'text'})
    fbToken: string;

    @Column({type: 'text'})
    gameCookie: string;
    
    @Column({type: 'text'})
    settings: string;

    @Column({type: 'text'})
    userData: string;

    @Column({type: 'text'})
    missions: string;

    @Column({type: 'datetime'})
    checkinAt: Date;

    @Column({type: 'datetime'})
    missionCompletedAt: Date;

    @Column()
    status: boolean;

    @Column()
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

}