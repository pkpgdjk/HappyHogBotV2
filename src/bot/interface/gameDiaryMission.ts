export interface GameDiaryMissionList {
  List: GameDiaryMission[]
}

export enum MISSION_ID {
    SPEED_PIG = 170,
    PICK_30_COIN = 172,
    BUY_5_ITEM = 173,
    POISON = 174,
    FUCK = 175,
    SELL_PIG = 177,
    VISIT_FRIEND = 178,
    COMPLETE_ALL = 179

}

export interface GameDiaryMission {
    Name: string;
    Desc: string;
    MissionId: MISSION_ID;
    Point: number;
    MaxPoint: number;
    Coin: number;
    Gem: number;
    Itemid: number;
    Amount: number;
    Type: number;
    Ispig: number;
    Exp: number;
    Complete: boolean;
  }

  