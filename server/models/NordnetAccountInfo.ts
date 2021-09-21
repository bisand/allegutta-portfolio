import { NordnetCurrency } from "./Currency";
import { NordnetPrice } from "./NordnetPrice";

export class NordnetAccountInfo {
    account_credit: NordnetPrice;
    collateral: NordnetPrice;
    pawn_value: NordnetPrice;
    trading_power: NordnetPrice;
    loan_limit: NordnetPrice;
    forward_sum: NordnetPrice;
    future_sum: NordnetPrice;
    account_currency: NordnetCurrency;
    interest: NordnetPrice;
    account_sum: NordnetPrice;
    unrealized_future_profit_loss: NordnetPrice;
    own_capital: NordnetPrice;
    own_capital_morning: NordnetPrice;
    full_marketvalue: NordnetPrice;
    account_code: string;
    registration_date: string;
    accno: number;
    accid: number;
}
