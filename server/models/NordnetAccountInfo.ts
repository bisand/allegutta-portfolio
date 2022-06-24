import { NordnetCurrency } from "./Currency";
import { NordnetPrice } from "./NordnetPrice";

export class NordnetAccountInfo {
    account_credit: NordnetPrice | undefined;
    collateral: NordnetPrice | undefined;
    pawn_value: NordnetPrice | undefined;
    trading_power: NordnetPrice | undefined;
    loan_limit: NordnetPrice | undefined;
    forward_sum: NordnetPrice | undefined;
    future_sum: NordnetPrice | undefined;
    account_currency: NordnetCurrency | undefined;
    interest: NordnetPrice | undefined;
    account_sum: NordnetPrice | undefined;
    unrealized_future_profit_loss: NordnetPrice | undefined;
    own_capital: NordnetPrice | undefined;
    own_capital_morning: NordnetPrice | undefined;
    full_marketvalue: NordnetPrice | undefined;
    account_code: string | undefined;
    registration_date: string | undefined;
    accno: number | undefined;
    accid: number | undefined;
}
