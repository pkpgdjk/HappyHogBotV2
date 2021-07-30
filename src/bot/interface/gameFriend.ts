export interface GameFriendList {
  List: GameFriend[];
}

export interface GameFriend {
  Id: number;
  Level: number;
  Type: number;
  Point: number;
  Userid: string;
  Name: string;
}
