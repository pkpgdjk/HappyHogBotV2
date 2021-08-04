import { User } from './user.entity';
import { IAccountSettings } from '../interface/account-settings.interface';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { IAccountUserData } from '../interface/account-user-data.interface';
import { Account } from './account.entity';
import { LogType } from '../enum/log-type.enum';

@Entity()
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: LogType,
    default: LogType.DEFAULT,
    nullable: true,
  })
  type?: LogType;

  @Column({ type: 'datetime', nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.logs, {
    onDelete: 'CASCADE',
  })
  account: Account;
}
