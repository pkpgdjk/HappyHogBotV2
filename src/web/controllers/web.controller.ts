import { SchedulerService } from './../../scheduler/scheduler/scheduler.service';
import { SettingDto } from './../dto/setting.dto';
import { User } from './../../entities/user.entity';
import { LoginDto } from './../dto/login.dto';
import {
  Controller,
  Get,
  Post,
  Render,
  Res,
  Request,
  Response,
  Session,
  Req,
  Body,
  UseGuards,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import * as secureSession from 'fastify-secure-session';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebService } from '../services/web/web.service';
import { UserId } from '../decarator/userId.decarator';
import * as dayjs from 'dayjs';
import { AccountDto } from '../dto/account.dto';

@Controller('web')
export class WebController {
  constructor(private webService: WebService) {}

  @Get('/login')
  @Render('login')
  getLoginPage(
    @Session() session: secureSession.Session,
    @Req() req: FastifyRequest,
    @Res() res,
  ) {
    if (session.get('userId')) {
      res.redirect(302, '/web/accounts');
    } else {
      res.view('login');
    }
  }

  @Post('/login')
  async login(
    @Session() session: secureSession.Session,
    @Res() res,
    @Body() loginDto: LoginDto,
  ) {
    const user = await this.webService.login(
      loginDto.username,
      loginDto.password,
    );
    if (user) {
      session.set('userId', user.id);
      res.redirect(302, '/web/accounts');
    } else {
      res.view('login', {
        msgType: 'error',
        msg: 'ชื่อหรือรหัสผ่านไม่ถูกต้อง',
      });
    }
  }

  @Get('/logout')
  async logout(@Session() session: secureSession.Session, @Res() res) {
    session.delete();
    res.redirect(302, '/web/login');
  }

  @Get('/accounts')
  async accounts(
    @Res() req: FastifyRequest,
    @Res() res,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    res.view('accounts', { user, dayjs });
  }

  @Post('/account')
  async account(
    @Res() req: FastifyRequest,
    @Res() res,
    @Body() accountDto: AccountDto,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    const account = await this.webService.createOrUpdateAccount(
      accountDto,
      userId,
    );
    res.redirect(302, '/web/accounts');
  }

  @Delete('/api/account/:accountId')
  async deleteAccount(
    @Res() req: FastifyRequest,
    @Res() res,
    @Param('accountId') accountId: string,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    const logs = await this.webService.deleteAccount(accountId);
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({});
  }

  @Post('/account/setting')
  async setting(
    @Res() req: FastifyRequest,
    @Res() res,
    @Body() settingDto: SettingDto,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    const account = await this.webService.setting(settingDto, userId);
    res.redirect(302, '/web/accounts');
  }

  @Get('/api/account/:accountId/log')
  async getLog(
    @Res() req: FastifyRequest,
    @Res() res,
    @Param('accountId') accountId: string,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    const logs = await this.webService.getLog(accountId);
    res
      .code(200)
      // .header('Content-Type', 'application/json; charset=utf-8')
      .send(
        logs
          .map((log) => {
            return `${dayjs.tz(log.createdAt).format('YYYY-MM-DD HH:mm:ss')} ${
              log.message
            }`;
          })
          .join('\n'),
      );
  }

  @Delete('/api/account/:accountId/log')
  async clearLog(
    @Res() req: FastifyRequest,
    @Res() res,
    @Param('accountId') accountId: string,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    const logs = await this.webService.clearLog(accountId);
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({});
  }

  @Post('/api/account/:accountId/check-food')
  async checkFood(
    @Res() req: FastifyRequest,
    @Res() res,
    @Param('accountId') accountId: string,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    this.webService.checkFood(accountId);
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({});
  }

  @Post('/api/account/:accountId/check-mission')
  async checkMission(
    @Res() req: FastifyRequest,
    @Res() res,
    @Param('accountId') accountId: string,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    this.webService.checkMission(accountId);
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({});
  }

  @Post('/api/account/:accountId/check-checkin')
  async checkCheckIn(
    @Res() req: FastifyRequest,
    @Res() res,
    @Param('accountId') accountId: string,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    this.webService.checkCheckIn(accountId);
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({});
  }

  @Put('/api/account/:accountId/status')
  async updateStatus(
    @Res() req: FastifyRequest,
    @Res() res,
    @Param('accountId') accountId: string,
    @Body('status') status: boolean,
    @UserId() userId?: string,
  ) {
    const user = await this.webService.getUserById(userId);
    if (!user) {
      res.redirect(302, '/web/login');
    }

    await this.webService.updateStatus(accountId, status);
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({});
  }
}
