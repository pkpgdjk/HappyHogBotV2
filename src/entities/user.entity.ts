import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Account } from './account.entity';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    isActive: boolean;

    @OneToMany(() => Account, account => account.owner)
    accounts: Account[];

}