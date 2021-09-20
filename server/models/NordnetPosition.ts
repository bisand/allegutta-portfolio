import { NordnetPrice } from "./NordnetPrice";
import { NordnetInstrument } from "./NordnetInstrument";


export interface NordnetPosition {
  accno: number;
  accid: number;
  instrument: NordnetInstrument;
  main_market_price: NordnetPrice;
  morning_price: NordnetPrice;
  qty: number;
  pawn_percent: number;
  market_value_acc: NordnetPrice;
  market_value: NordnetPrice;
  acq_price: NordnetPrice;
  acq_price_acc: NordnetPrice;
  is_custom_gav: boolean;
  margin_percent: number;
}
