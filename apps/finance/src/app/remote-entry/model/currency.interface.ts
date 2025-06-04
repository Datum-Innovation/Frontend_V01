export interface ALLCURRENCIES {
    currencyID: number;
    currency: string;
    abbreviation: string;
}

export interface CURRENCY {
    currencyID: number;
  currency: string;
  abbreviation: string;
  defaultCurrency: boolean;
  currencyRate: number;
  createdBy: number;
  createdOn: string;
  activeFlag: number;
  precision: number;
  culture: string;
  coin: string;
  formatString: string;
  symbol:string;
}

export interface CURRENCYCODES{
  id:number;
  code: string;
  name: string;
}

