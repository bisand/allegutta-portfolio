import { NordnetCurrency } from "./Currency";

export interface NordnetPrice {
  currency: NordnetCurrency;
  value: number;
}
