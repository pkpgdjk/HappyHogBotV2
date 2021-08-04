import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isToday from 'dayjs/plugin/isToday';
import * as dayjs from 'dayjs';
import secureSession from 'fastify-secure-session';

async function bootstrap() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(isToday);
  dayjs.tz.setDefault('America/New_York');

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: false }));
  app.useStaticAssets({
    root: join(__dirname, 'web', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      ejs: require('ejs'),
    },
    layout: './layouts/main',
    includeViewExtension: true,
    templates: join(__dirname, './web', 'views'),
  });

  app.register(secureSession, {
    secret: 'averylogphrasebiggerthanthirtytwochars',
    salt: 'mq9hDxBVDbspDR6n',
    cookie: {
      path: '/',
      httpOnly: true, // Use httpOnly for all production purposes
      // options for setCookie, see https://github.com/fastify/fastify-cookie
    },
  });

  app.enableCors();

  await app.listen(process.env.PORT || 3000);
  console.log(`server is running on ${await app.getUrl()}`);
}
bootstrap();
