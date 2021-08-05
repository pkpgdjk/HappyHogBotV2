import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class FacebookService {
  public async getFbTokenByCookie(cookie: any[]): Promise<string> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
      const page = await browser.newPage();

      await page.setCookie(...cookie);
      await page.goto(
        'https://m.facebook.com/v9.0/dialog/oauth?return_scopes=true&default_audience=friends&sso=chrome_custom_tab&ies=1&client_id=223997212619167&cct_prefetching=0&state=%7B%220_auth_logger_id%22%3A%2222fc847c-1578-481c-926a-c65b55543550%22%2C%223_method%22%3A%22custom_tab%22%2C%227_challenge%22%3A%229q7c81gjjmnqt9cglesv%22%7D&cbt=1625656565271&auth_type=rerequest&scope=public_profile%2Cuser_friends%2Cemail&redirect_uri=fbconnect%3A//cct.com.Indraft.HappyHog&sdk=android-9.1.1&login_behavior=NATIVE_WITH_FALLBACK&e2e=%7B%22init%22%3A1625656565271%7D&response_type=token%2Csigned_request%2Cgraph_domain',
        { waitUntil: 'networkidle2' },
      );

      await page.waitForSelector('[name="__CONFIRM__"]');
      await page.click('[name="__CONFIRM__"]');
      let token: string = '';
      await page.waitForResponse((response) => {
        let redirect_uri = response.headers()?.location;
        let extracts = /access_token=(.*?)&/.exec(redirect_uri);
        let t = extracts?.[1];
        token = t;
        return !!t;
      });
      await browser.close();

      console.log('getFbTokenByCookie token', token);
      return token;
    } catch (error) {
      console.log('getFbTokenByCookie', error);
      throw error;
    }
  }
}
