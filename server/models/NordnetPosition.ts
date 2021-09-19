  export interface Price {
    currency: string;
    value: number;
  }

  export interface Tradable {
    market_id: number;
    tick_size_id: number;
    display_order: number;
    lot_size: number;
    mic: string;
    identifier: string;
  }

  export interface Instrument {
    mifid2_category: number;
    price_type: string;
    tradables: Tradable[];
    instrument_id: number;
    asset_class: string;
    instrument_type: string;
    instrument_group_type: string;
    currency: string;
    multiplier: number;
    pawn_percentage: number;
    margin_percentage: number;
    symbol: string;
    isin_code: string;
    sector: string;
    sector_group: string;
    name: string;
  }

  export interface NordnetPosition {
    accno: number;
    accid: number;
    instrument: Instrument;
    main_market_price: Price;
    morning_price: Price;
    qty: number;
    pawn_percent: number;
    market_value_acc: Price
    market_value: Price;
    acq_price: Price;
    acq_price_acc: Price;
    is_custom_gav: boolean;
    margin_percent: number;
  }
