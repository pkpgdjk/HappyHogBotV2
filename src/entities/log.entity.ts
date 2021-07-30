import { User } from './user.entity';
import { IAccountSettings } from "../interface/account-settings.interface";
import {Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, ManyToOne, CreateDateColumn} from "typeorm";
import { IAccountUserData } from '../interface/account-user-data.interface';
import { Account } from './account.entity';

@Entity()
export class Log {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    message: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Account, account => account.logs)
    account: Account;

}