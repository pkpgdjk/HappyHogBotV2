import { IAccountSettings } from './../../interface/account-settings.interface';
export class SettingDto{
    accountId: string;
    autoFarm: "on" | "off";
    autoMission: "on" | "off";
    speedMatingMission: "on" | "off";
    autoBuyItem: "on" | "off";
    sellGodPig: "on" | "off";
    poisonFarm: string;
    foodId: number;
    buyFoodId: number;
}