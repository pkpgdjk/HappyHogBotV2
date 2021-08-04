import { Injectable } from '@nestjs/common';
import {
  COIN_ITEM_LEVEL_1,
  COIN_ITEM_LEVEL_2,
  COIN_ITEM_LEVEL_3,
} from '../../class/coin-item.class';
import { ICOIN_ITEM } from '../../interface/coin-item.interface';

@Injectable()
export class UtilityService {
  public getMaxPigByFarmLevel(level: number): number {
    return {
      '1': 6,
      '2': 12,
      '3': 18,
      '4': 24,
      '5': 24,
    }[level];
  }
  public getItemIdByFarmLevel(level: number): ICOIN_ITEM {
    return {
      ['1']: new COIN_ITEM_LEVEL_1(),
      ['2']: new COIN_ITEM_LEVEL_2(),
      ['3']: new COIN_ITEM_LEVEL_3(),
    }[level];
  }

  public async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async retryPromise(promise, nthTry = 5, delayTime = 1000) {
    try {
      const res = await promise;
      return res;
    } catch (e) {
      if (nthTry === 1) {
        return Promise.reject(e);
      }
      await this.sleep(delayTime);
      return this.retryPromise(promise, nthTry - 1, delayTime);
    }
  }
}
