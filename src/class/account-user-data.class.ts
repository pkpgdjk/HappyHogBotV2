import { IAccountUserData } from '../interface/account-user-data.interface';
export class AccountUserData implements IAccountUserData {
    user: { wheels: number; userid: string; tutorial: number; point: number; pigcount: number; maxexp: number; level: number; gems: number; exp: number; coins: number; maxPig: number; };
    farm: { farmLevel: number; factoryLevel: number; };
    items: { poison: number; femaleSpeedPotion: number; burger: number; };
}