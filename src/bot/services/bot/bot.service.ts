import { Injectable } from '@nestjs/common';
import { UtilityService } from '../../../utility/utility/utility.service';
import { GameDiaryMission, MISSION_ID } from '../../interface/gameDiaryMission';
import { GameService } from '../game/game.service';
import { LogService } from '../../../log/log/log.service';
import { Account } from '../../../entities/account.entity';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { GEM_ITEM } from '../../../enum/gem-item.enum';
import { FacebookService } from '../facebook/facebook.service';

@Injectable()
export class BotService {
  constructor(private utility: UtilityService, private gameService: GameService, private logService: LogService, private facebookService: FacebookService) {}

  public async loginIntoAccount(account: Account): Promise<Account> {
    try {
      if (account.gameCookie && (await this.gameService.checkGameCookie(account.gameCookie))) {
        this.logService.log('ใช้ gameCookie เดิม', account);
        account.loginStatus = true;
        return account;
      }

      this.logService.log('กำลังดึง fb-token', account);
      let gameCookie = '';
      let fbToken = account.fbToken;
      if (fbToken) {
        try {
          this.logService.log('กำลัง login เข้าเกม ด้วย fb-token เก่า', account);
          gameCookie = await this.gameService.login(account.fbToken);
        } catch (error) {
          account.fbToken = '';
        }
      }

      if (!gameCookie) {
        this.logService.log('กำลังดึง fb token ใหม่', account);
        const cookie = JSON.parse(account.fbCookie);
        fbToken = await this.facebookService.getFbTokenByCookie(cookie);
        account.fbToken = fbToken;

        this.logService.log('กำลัง login เข้าเกม ด้วย fb-token ใหม่', account);
        gameCookie = await this.gameService.login(fbToken);
      }

      account.fbToken = fbToken;
      account.gameCookie = gameCookie;
      account.loginStatus = true;
      account.userData = JSON.stringify(await this.gameService.fetchUserData(account));
      this.logService.log('login สำเร็จ', account);
    } catch (error) {
      this.logService.alert('login ไม่ผ่าน', account);
      account.loginStatus = false;
    } finally {
      return account;
    }
  }

  public async checkFood(account: Account): Promise<any> {
    try {
      this.logService.log('กำลังดูแลหมู', account);

      const farm = await this.gameService.getStatus(account);
      await this.utility.sleep(1500);

      let isHungry = !!farm.pigs_list.find((p) => p.Pig_food);
      const isWater = farm.pigs_list.find((p) => p.Pig_water);
      const isFry = farm.fly;

      const farmLevel = account.getUserData().farm.farmLevel;
      const COIN_ITEMS = this.utility.getItemIdByFarmLevel(farmLevel);
      const buyFood = account.getSettings().buyFoodId;
      const foodId = account.getSettings().foodId;

      if (!isHungry) {
        let pig = farm.pigs_list[0];
        let pigStatus = await this.gameService.getPigDetail(account, pig.Id);
        isHungry = pigStatus.WeightBuff < 0.3;
      }

      if (isHungry) {
        this.logService.log('หมูหิวแล้ว', account);
        let myFoods = await this.gameService.getMyFood(account);
        let food = myFoods.find((f) => f.Itemid == foodId && f.Itemtype == 0);
        this.logService.log(`จำนวนอาหารที่เหลือ: ${food?.Quantity || 0}`, account);
        if (!food || food.Quantity <= 3) {
          this.logService.log('อาหารเหลือน้อยแล้ว', account);
          if (account.getSettings().autoBuyItem) {
            await this.gameService.buyFood(account, buyFood || COIN_ITEMS.BURGER, 10);
            await this.utility.sleep(1500);
            this.logService.log('กำลังซื้ออาหารเพิ่ม', account);
            myFoods = await this.gameService.getMyFood(account);
            await this.utility.sleep(1500);
            food = myFoods.find((f) => f.Itemid === foodId && f.Itemtype === 0);
          } else {
            this.logService.alert('อาหารหมูเหลือเนื้อแล้ว !!!!', account);
          }
        }
        await this.gameService.feedFood(account, food.InventoryId);
        this.logService.log('ให้อาหารหมูแล้ว', account);
        await this.utility.sleep(1500);
      }

      if (isHungry || farm.itemdrops_list.length > 0) {
        const farm = await this.gameService.getStatus(account);
        this.logService.log(`เจอ ${farm.itemdrops_list.length} coins`, account);

        for (let i = 0; i < farm.itemdrops_list.length; i++) {
          try {
            const item = farm.itemdrops_list[i];
            await this.gameService.pickItem(account, item.Id);
            await this.utility.sleep(2000);
            this.logService.log(`- เก็บ ${item.Coin} coin`, account);
          } catch (err) {
            this.logService.alert(`${err?.response?.data || 'pick coin error'}`, account);
          }
        }
      }

      if (isWater) {
        await this.gameService.feedWater(account);
        this.logService.log('ให้น้ำหมูแล้ว', account);
        await this.utility.sleep(1500);
      }

      if (isFry) {
        await this.gameService.shower(account);
        this.logService.log('อาบน้ำหมูแล้ว', account);
        await this.utility.sleep(1500);
      }
    } catch (err) {
      this.logService.alert(`เกิดข้อผิดพลาดในการเลี้ยงหมู ${err?.message}`, account);
      throw err;
    } finally {
      this.logService.save();
    }
  }

  public async checkDiaryMission(account: Account): Promise<void> {
    try {
      if (!account.getSettings().autoMission) {
        return;
      }

      let missions = (await this.gameService.getDiaryMission(account))?.List;
      let mission: GameDiaryMission;
      await this.utility.sleep(2000);

      SPEED_POTION_MISSION: {
        mission = missions.find((m) => m.MissionId === MISSION_ID.SPEED_PIG);
        if (!mission || mission.Complete) {
          break SPEED_POTION_MISSION;
        }

        if (account.getUserData().user.pigcount >= account.getUserData().user.maxPig) {
          this.logService.alert(`คอกเต็ม`, account);
          break SPEED_POTION_MISSION;
        }

        if (mission.Point >= mission.MaxPoint) {
          break SPEED_POTION_MISSION;
        }

        let fuck_mission = missions.find((m) => m.MissionId === MISSION_ID.FUCK);

        if (fuck_mission && fuck_mission.Point < mission.MaxPoint) {
          break SPEED_POTION_MISSION;
        }

        mission.MissionId = MISSION_ID.FUCK;
        mission.Point = 0;
        mission.MaxPoint = 1;
        mission.Desc = 'SPEED_POTION_MISSION';
      }

      FUCK_MISSION: {
        mission = missions.find((m) => m.MissionId === MISSION_ID.FUCK);
        if (mission && mission.Complete == false) {
          if (mission.Point < mission.MaxPoint) {
            if (account.getUserData().user.pigcount >= account.getUserData().user.maxPig) {
              this.logService.alert('คอกหมเต็มแล้ว !!', account);
              break FUCK_MISSION;
            }

            for (let i = 0; i < mission.MaxPoint - mission.Point; i++) {
              this.logService.log(`ทำภารกิจผสมพันธ์หมู ${i + 1}`, account);
              let pigs = (await this.gameService.getStatus(account)).pigs_list;
              await this.utility.sleep(2000);

              let inventory = await this.gameService.getPigPotion(account);
              await this.utility.sleep(2000);

              let malePigs = await this.gameService.getMatingList(account);
              await this.utility.sleep(2000);

              let female = pigs.find((m) => m.Pig_sex == 1 && m.Pig_size == 1 && m.Pig_pregnant == 0);
              let male = malePigs.List?.[0];

              if (!female || !male) {
                this.logService.alert(`ไม่มีหมูตัวผู้หรือตัวเมีย`, account);
                break FUCK_MISSION;
              }

              // mating
              await this.gameService.mating(account, female.Id, male.Id);
              await this.utility.sleep(2000);

              if (account.getSettings().speedMatingMission) {
                // check potion and buy more
                let speedPotion = inventory.find((i) => i.Itemid == 11 && i.Itemtype == 1 && i.Itemoption == 5);
                if (!speedPotion || speedPotion.Quantity < 2) {
                  // change item id;
                  if (account.getSettings().autoBuyItem) {
                    this.logService.log(`ซื้อยาแร่งผสมพันธ์`, account);
                    await this.gameService.buyItem(account, this.utility.getItemIdByFarmLevel(account.getUserData().farm.farmLevel).FEMALE_MATING_SPEED, 10, 2);
                    inventory = await this.gameService.getPigPotion(account);
                    await this.utility.sleep(2000);
                    speedPotion = inventory.find((i) => i.Itemid == 11 && i.Itemtype == 1 && i.Itemoption == 5);
                  } else {
                    this.logService.alert('ยาเร่งผสมพันธ์ไม่พอ !!!', account);
                    // change settings
                    let settings = account.getSettings();
                    settings.speedMatingMission = false;
                    account.settings = JSON.stringify(settings);
                    break FUCK_MISSION;
                  }
                }
                await this.gameService.usePigPotion(account, speedPotion.InventoryId, female.Id);
                await this.utility.sleep(2000);
                await this.gameService.usePigPotion(account, speedPotion.InventoryId, female.Id);
                await this.utility.sleep(2000);

                await this.utility.retryPromise(this.sellNewLittlePig(account), 3, 1000);
              } else {
                setTimeout(async () => {
                  await this.utility.retryPromise(this.sellNewLittlePig(account), 3, 1000);
                }, 6 * 60 * 60 * 1000 + 5 * 60 * 1000); // 6hr 5 min
              }

              this.logService.log(`ผสมพันธ์สำเร็จ`, account);
            }
          }
          if (mission.Desc == 'SPEED_POTION_MISSION') {
            await this.gameService.getMissionReward(account, MISSION_ID.SPEED_PIG);
          } else {
            await this.gameService.getMissionReward(account, mission.MissionId);
          }

          this.logService.log(`รับรางวัล ผสมพันธ์สำเร็จ`, account);
        }
      }

      missions = (await this.gameService.getDiaryMission(account))?.List;
      await this.utility.sleep(2000);

      SELL_PIG_MISSION: {
        mission = missions.find((m) => m.MissionId === MISSION_ID.SELL_PIG);
        if (!mission || mission.Complete) {
          break SELL_PIG_MISSION;
        }

        this.logService.log(`ทำภารกิจขายหมู`, account);

        if (account.getUserData().user.pigcount >= account.getUserData().user.maxPig) {
          this.logService.alert(`คอกเต็ม`, account);
          break SELL_PIG_MISSION;
        }

        for (let i = 0; i < mission.MaxPoint - mission.Point; i++) {
          await this.gameService.buyItem(account, 84, 1, 2);
          this.logService.log(`ซื้อหมูตัวที่ ${i + 1}`, account);
          await this.utility.sleep(2000);

          let pigs = (await this.gameService.getStatus(account)).pigs_list;
          await this.utility.sleep(2000);

          let littlePig = _.minBy(pigs, 'Pig_weight');
          if (littlePig.Pig_weight > 20 || littlePig.Pig_id != 45) {
            break SELL_PIG_MISSION;
          }

          await this.utility.sleep(5000);
          await this.gameService.sellPig(account, littlePig.Id);
          this.logService.log(`ขายหมูตัวที่ ${i + 1}`, account);
          await this.utility.sleep(1000);
        }

        await this.gameService.getMissionReward(account, mission.MissionId);
        this.logService.log(`รับรางวัล ขายหมู`, account);
      }

      BUY_5_ITEM_MISSION: {
        mission = missions.find((m) => m.MissionId === MISSION_ID.BUY_5_ITEM);
        if (!mission || mission.Complete) {
          break BUY_5_ITEM_MISSION;
        }

        this.logService.log(`ทำภารกิจซื้อของ`, account);
        await this.gameService.buyFood(account, account.getSettings().buyFoodId, 10);
        await this.utility.sleep(2000);

        await this.gameService.getMissionReward(account, mission.MissionId);
        this.logService.log(`รับรางวัลซื้อของ`, account);
      }

      POISON_MISSION: {
        mission = missions.find((m) => m.MissionId === MISSION_ID.POISON);
        if (!mission || mission.Complete) {
          break POISON_MISSION;
        }

        this.logService.log(`ทำภารกิจวางยา`, account);
        let poison = (await this.gameService.getPoison(account)).find((p) => p.Itemid == 14 && p.Itemtype == 4);
        await this.utility.sleep(2000);

        if (!poison || poison.Quantity == 1) {
          if (account.getSettings().autoBuyItem) {
            await this.gameService.buyItem(account, GEM_ITEM.POISON, 1, 1);
            this.logService.log(`ซื้อยาถ่าย`, account);
            poison = (await this.gameService.getPoison(account)).find((p) => p.Itemid == 14 && p.Itemtype == 4);
          }
        }

        if (!poison) {
          this.logService.alert(`ยาถ่ายไม่พอ`, account);
          break POISON_MISSION;
        }

        await this.gameService.usePoison(account, poison.InventoryId, account.getSettings().poisonFarm);
        this.logService.log(`วางยาสำเร็จ`, account);
        await this.utility.sleep(2000);

        await this.gameService.getMissionReward(account, mission.MissionId);
        this.logService.log(`รับรางวัล ภารกิจวางยา`, account);
      }

      VISIT_FRIEND_MISSION: {
        mission = missions.find((m) => m.MissionId === MISSION_ID.VISIT_FRIEND);
        if (!mission || mission.Complete) {
          break VISIT_FRIEND_MISSION;
        }
        this.logService.log(`ทำภารกิจเยี่ยมเพื่อน`, account);
        let friends = await this.gameService.getFriendLists(account);
        if (friends?.[0]) {
          for (let i = 0; i < 10; i++) {
            await this.gameService.getFriendFarmDetail(account, friends?.[0].Userid);
            await this.utility.sleep(2000);
          }
        }

        await this.gameService.getMissionReward(account, mission.MissionId);
        this.logService.log(`รับรางวัลภารกิจเยี่มเพื่อน`, account);
      }

      missions = (await this.gameService.getDiaryMission(account))?.List;
      await this.utility.sleep(2000);
      await Promise.all(
        missions.map(async (mission) => {
          if (mission.Point >= mission.MaxPoint && mission.Complete == false) {
            await this.gameService.getMissionReward(account, mission.MissionId);
            await this.utility.sleep(2000);
          }
        }),
      );

      missions = (await this.gameService.getDiaryMission(account))?.List;
      await this.utility.sleep(2000);
      mission = missions.find((m) => m.MissionId === MISSION_ID.COMPLETE_ALL);
      if (mission.Point >= mission.MaxPoint && mission.Complete == false) {
        await this.gameService.getMissionReward(account, mission.MissionId);
        mission.Complete = true;
      }
      account.missions = JSON.stringify(missions);

      if (mission.Complete) {
        this.logService.log(`ทำภารกิจทั้งหมดเสร็จแล้ว`, account);
        account.missionCompletedAt = dayjs.tz(new Date()).toDate();
      }
    } catch (err) {
      this.logService.alert(`เกิดข้อผิดพลาดในการทำภารกิจรายวัน ${err?.message}`, account);
      throw err;
    } finally {
      let missions = (await this.gameService.getDiaryMission(account))?.List;
      account.missions = JSON.stringify(missions);
      this.logService.save();
    }
  }

  public async dailyCheckIn(account: Account): Promise<any> {
    try {
      let list = await this.gameService.getCheckInList(account);
      let todayChecking = list.List.find((m) => m.Today);
      let myList = list.MyList;

      let isCheckedIn = myList.find((m) => m.DailyId == todayChecking.Id);

      if (isCheckedIn) {
        account.checkinAt = dayjs.tz(new Date()).toDate();
      } else {
        await this.gameService.checkIn(account);
        this.logService.log(`เช็คอินสำเร็วแล้ว`, account);
        account.checkinAt = dayjs.tz(new Date()).toDate();
      }
    } catch (err) {
      this.logService.alert(`เกิดข้อผิดพลาดในการเช็คอิน ${err?.message}`, account);
      throw err;
    } finally {
      this.logService.save();
    }
  }

  public async sellNewLittlePig(account: Account): Promise<any> {
    try {
      let pigs = (await this.gameService.getStatus(account)).pigs_list;
      await this.utility.sleep(2000);
      pigs = _.sortBy(pigs, 'Pig_weight');

      account.userData = JSON.stringify(await this.gameService.fetchUserData(account));

      if (account.getUserData().user.pigcount < account.getUserData().user.maxPig) {
        this.logService.log(`คอกยังว่าง`, account);
        return;
      }

      let clearPigCount = account.getUserData().user.pigcount - (account.getUserData().user.maxPig - 1);

      for (let i = 0; i < clearPigCount; i++) {
        let littlePig = pigs[i];
        if (littlePig.Pig_size == 1) {
          continue;
        }

        if (!account.getSettings().sellGodPig && littlePig.Pig_notdead == 1) {
          this.logService.log(`ข้ามการขายหมู เจอหมูอมตะ`, account);
          continue;
        }

        await this.gameService.sellPig(account, littlePig.Id);
        this.logService.log(`ขายหมู`, account);
        await this.utility.sleep(2000);
      }
    } catch (error) {
      this.logService.alert(`เกิดข้อผิดพลาดในการขายหมู ${error?.message}`, account);
      console.log(error);
    }
  }
}
