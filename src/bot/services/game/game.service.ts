import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';
import { LoginException } from 'src/exception/bot/login.exception';
import { GameFarmInfo } from '../../interface/gameFarmInfo';
import { GameUserInfo } from '../../interface/gameUserInfo';
import { AccountUserData } from '../../../class/account-user-data.class';
import { UtilityService } from '../../../utility/utility/utility.service';
import { GameStatus } from '../../interface/gameStatus';
import { GamePigStatus } from '../../interface/gamePigStatus';
import { GameItem } from '../../interface/gameItem';
import { GameSpinResult } from '../../interface/gameSpin';
import { GamePigDetail } from '../../interface/gamePigDetail';
import { GameDiaryMissionList } from '../../interface/gameDiaryMission';
import { GameMatingLists } from '../../interface/gameMating';
import { GameFriend } from '../../interface/gameFriend';
import { GameCheckInList } from '../../interface/gameCheckIn';
import { Account } from '../../../entities/account.entity';

@Injectable()
export class GameService {
    constructor(
        private httpService: HttpService,
        private utility: UtilityService,
    ) {}

    private httpConfig(cookie: string = ''){
        return {
            baseURL: 'https://api-z.happy-hog.in.th',
            withCredentials: true,
            headers: {
                'User-Agent': 'HappyHogM/0 CFNetwork/1240.0.4 Darwin/20.5.0',
                'X-Unity-Version': '2019.4.17f1',
                'Accept': '*/*',
                'Accept-Language': 'en-us',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie
            }
        }
    }

   public async checkGameCookie(cookie: string): Promise<boolean>{
       return false;
   }

    public async fetchUserData(account: Account): Promise<AccountUserData>{
        let userInfo = await this.getUserInfo(account);
        await this.utility.sleep(2000)
        let farmInfo = await this.getFarmInfo(account, userInfo.userid);
        await this.utility.sleep(2000)
        let accountUserData = new AccountUserData()
        accountUserData.user = userInfo
        accountUserData.user.maxPig = this.utility.getMaxPigByFarmLevel(farmInfo.farm)
        await this.utility.sleep(2000)
        accountUserData.farm = {
            factoryLevel: farmInfo.factory,
            farmLevel: farmInfo.farm
        }
        // accountUserData.items
        return accountUserData;
    }



    public async login(fbToken: string): Promise<string>{
        try {
            let res = await this.httpService.post('/register', `logintype=1&logintoken=${fbToken}&device=APPLE&version=2.0.3`, this.httpConfig()).toPromise()
            await this.utility.sleep(1000)

            let gameToken = res?.data?.AccessToken
            if (!gameToken){
                throw new LoginException("can't get AccessToken from /register.")
            }

            let loginRes = await this.httpService.post('/login', `logintoken=${fbToken}&accesstoken=${gameToken}&logintype=1&FCM=0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`, this.httpConfig()).toPromise()
            await this.utility.sleep(1000)

            let cookie = loginRes.headers['set-cookie']?.[0]?.split?.(";")?.[0]

            if(!cookie){
                throw new LoginException("can't get cookie from /login.")
            }
            return cookie
        }catch(err){
            throw err;
        }
    }

    public async getUserInfo(account: Account): Promise<GameUserInfo>{
        try {
            let res = await this.httpService.post('/userinfo', '', this.httpConfig(account.gameCookie)).toPromise();
            let data = res.data as GameUserInfo
            return data
        } catch (err) {
            throw err;
        }
    }

    public async getFarmInfo(account: Account, userId: string): Promise<GameFarmInfo>{
        try {
            let res = await this.httpService.post('/farminfo', `userid=${userId}`, this.httpConfig(account.gameCookie)).toPromise();
            let data = res.data as GameFarmInfo
            return data
        } catch (err) {
            throw err;
        }
    }

    public async getStatus(account: Account): Promise<GameStatus>{
        try {
            let res = await this.httpService.post('/status', '', this.httpConfig(account.gameCookie)).toPromise();
            return res.data as GameStatus
        } catch (err) {
            throw err;
        }
    }

    public async pigStatus(account: Account,id: number): Promise<GamePigStatus>{
        try {
            let res = await this.httpService.post('/pigbalance', `type=3&idpig=${id}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data as GamePigStatus
        } catch (err) {
            throw err;
        }
    }

    public async getMyFood(account: Account): Promise<GameItem[]>{
        try {
            let res = await this.httpService.post('/inventory', 'itemtypelist=%7b%22TypeList%22%3a%5b0%5d%7d', this.httpConfig(account.gameCookie)).toPromise();
            return res.data?.itemlist?.map(item => item as GameItem) 
        } catch (err) {
            throw err;
        }
    }

    public async feedFood(account: Account, foodId: number): Promise<void> {
        try {
            let res = await this.httpService.post('/useitems', `invid=${foodId}&type=1`, this.httpConfig(account.gameCookie)).toPromise();
        } catch (err) {
            throw err;
        }
    }

    public async shower(account: Account): Promise<void> {
        try {
            let res = await this.httpService.post('/useitems', `type=3`, this.httpConfig(account.gameCookie)).toPromise();
        } catch (err) {
            throw err;
        }
    }

    public async feedWater(account: Account): Promise<void> {
        try {
            let res = await this.httpService.post('/useitems', `type=2`, this.httpConfig(account.gameCookie)).toPromise();
        } catch (err) {
            throw err;
        }
    }

    public async pickItem(account: Account, id: number): Promise<void> {
        try {
            let res = await this.httpService.post('/itemdrop', `dropid=${id}`, this.httpConfig(account.gameCookie)).toPromise();
        } catch (err) {
            throw err;
        }
    }

    public async buyFood(account: Account, id: number, amount: number): Promise<void> {
        try {
            let res = await this.httpService.post('/market', `type=2&buytype=2&storeId=${id}&amount=${amount}`, this.httpConfig(account.gameCookie)).toPromise();
        } catch (err) {
            throw err;
        }
    }

    public async spin(account: Account): Promise<GameSpinResult> {
        try {
            let res = await this.httpService.post('/wheel', `type=2`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data as GameSpinResult
        } catch (err) {
            throw err;
        }
    }

    public async getPigDetail(account: Account, id: number): Promise<GamePigDetail> {
        try {
            let res = await this.httpService.post('/pigbalance', `type=3&idpig=${id}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data as GamePigDetail
        } catch (err) {
            throw err;
        }
    }

    public async getDiaryMission(account: Account): Promise<GameDiaryMissionList> {
        try {
            let res = await this.httpService.post('/mission', `type=1&missiontype=1`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data as GameDiaryMissionList
        } catch (err) {
            throw err;
        }
    }

    public async getMissionReward(account: Account, id: number): Promise<any> {
        try {
            let res = await this.httpService.post('/mission/', `type=2&missionid=${id}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data
        } catch (err) {
            throw err;
        }
    }

    public async buyItem(account: Account, id: number, amount: number, type: number = 2): Promise<any> {
        try {
            let res = await this.httpService.post('/market', `type=2&buytype=${type}&storeId=${id}&amount=${amount}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data
        } catch (err) {
            throw err;
        }
    }

    public async sellPig(account: Account, id: number): Promise<any> {
        try {
            let res = await this.httpService.post('/sellpig', `type=2&piglist=%7b%22PigList%22%3a%5b${id}%5d%7d`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data
        } catch (err) {
            throw err;
        }
    }

    public async getMatingList(account: Account): Promise<GameMatingLists> {
        try {
            let res = await this.httpService.post('/mating', `type=1&pigid=-1`, this.httpConfig(account.gameCookie)).toPromise();
            let data: GameMatingLists = res.data as GameMatingLists
            data.List = data.List.sort((a,b) => a.Price - b.Price).reverse()
            return data;
        } catch (err) {
            throw err;
        }
    }

    public async mating(account: Account, female: number, male: number): Promise<any> {
        try {
            let res = await this.httpService.post('/mating', `type=2&idpigfemale=${female}&idpigmale=${male}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data
        } catch (err) {
            throw err;
        }
    }

    public async getPigPotion(account: Account): Promise<GameItem[]>{
        try {
            let res = await this.httpService.post('/inventory', 'itemtypelist=%7b%22TypeList%22%3a%5b1%5d%7d', this.httpConfig(account.gameCookie)).toPromise();
            return res.data?.itemlist?.map(item => item as GameItem) 
        } catch (err) {
            throw err;
        }
    }

    public async usePigPotion(account: Account, invid: number, pigid: number): Promise<any> {
        try {
            let res = await this.httpService.post('/useitems', `type=1&invid=${invid}&idpig=${pigid}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data;
        } catch (err) {
            throw err;
        }
    }

    public async getFriendLists(account: Account): Promise<GameFriend[]>{
        try {
            let res = await this.httpService.post('/friend', 'type=1&uid=', this.httpConfig(account.gameCookie)).toPromise();
            return res.data?.List?.map(item => item as GameFriend) 
        } catch (err) {
            throw err;
        }
    }

    public async getFriendFarmDetail(account: Account, userId: string): Promise<any>{
        try {
            let res = await this.httpService.post('/farminfo', `userid=${userId}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data
        } catch (err) {
            throw err;
        }
    }

    public async getPoison(account: Account): Promise<GameItem[]>{
        try {
            let res = await this.httpService.post('/inventory', 'itemtypelist=%7b%22TypeList%22%3a%5b4%5d%7d', this.httpConfig(account.gameCookie)).toPromise();
            return res.data?.itemlist?.map(item => item as GameItem) 
        } catch (err) {
            throw err;
        }
    }

    public async usePoison(account: Account, invid: number, friendid: string): Promise<any> {
        try {
            let res = await this.httpService.post('/useitems', `type=1&invid=${invid}&friendid=${friendid}`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data;
        } catch (err) {
            throw err;
        }
    }


    public async getCheckInList(account: Account): Promise<GameCheckInList> {
        try {
            let res = await this.httpService.post('/daily', `type=1`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data as GameCheckInList
        } catch (err) {
            throw err;
        }
    }

    public async checkIn(account: Account): Promise<any> {
        try {
            let res = await this.httpService.post('/daily', `type=2`, this.httpConfig(account.gameCookie)).toPromise();
            return res.data
        } catch (err) {
            throw err;
        }
    }

}
