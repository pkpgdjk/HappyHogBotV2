export interface GameCheckInList {
  List: CheckIn[];
  MyList: MyCheckIn[];
}

export interface CheckIn {
  Id: number;
  Coin: number;
  Itemid: number;
  Amount: number;
  Itemtype: number;
  ItemOption: number;
  Gem: number;
  Today: boolean;
}

export interface MyCheckIn {
  Id: number;
  DailyId: number;
}
