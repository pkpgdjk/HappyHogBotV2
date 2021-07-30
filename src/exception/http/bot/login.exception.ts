import { BotException } from "../../../interface/bot-exception.interface";

export class LoginException implements BotException {
    public name: string = "GAME_LOGIN_ERROR"
    constructor(public message: string, public stack?: string){}
}