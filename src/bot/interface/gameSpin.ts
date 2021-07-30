import { WHEEL_RESULT } from '../../enum/wheel-result';
export interface GameSpinResult {
    "Coin": number,
    "Gem": number,
    "Id": number,
    "JackPot": number,
    "Price": number,
    "Wheel": WHEEL_RESULT
}