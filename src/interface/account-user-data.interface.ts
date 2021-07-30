import { GameUserInfo } from '../bot/interface/gameUserInfo';

export interface IAccountUserData {
    user: GameUserInfo,
    farm:{
        farmLevel: number;
        factoryLevel: number;
    },
    items: {
        poison: number;
        femaleSpeedPotion: number;
        burger: number;
    },
}