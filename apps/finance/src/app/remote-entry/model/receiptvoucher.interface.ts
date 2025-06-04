
export interface PayType{
  id: number;
  name: string;
}

export interface chequePopup{
  alias: string;
  name: string;
  id:number;
}

export interface cardPopup{
  alias: string;
  name: string;
  id:number;
}

export interface cashPopup{
  accontcode: string;
  accontname: string;
  id:number;
}

export interface VoucherType{
  id: number;
  name: string;
}

export interface Currency{
  currencyID: number;
  abbreviation: string;
  currencyRate: number;
  defaultCurrency: boolean;
  precision: number;
  culture: string;
  formatString: string;
}


export interface Reference {
  sel: boolean;
  addItem: boolean;
  voucherID: number;
  vNo: string;
  vDate: string; // You can use Date if you convert the string to a Date object
  referenceNo: string | null;
  accountID: number;
  accountName: string;
  amount: number;
  partyInvNo: string | null;
  partyInvDate: string | null; // You can use Date if you convert the string to a Date object
  id: number;
  voucherType: string;
  mobileNo: string | null;
}

export interface receiptvoucher{
    fillTransactions:string   
  
}


export interface Items {
  name:string
}

export interface ItemOptions {
  id: number;
  itemCode: string;
  itemName: string;
  location: string | null;
  unit: string;
  stock: number;
  rate: number;
  purchaseRate: number;
  taxPerc: number;
  taxTypeID: number;
  factor: number;
  taxAccountID: number | null;
  avgCost: number | null;
  expiryDate: string;
  arabicName: string | null;
  partNo: string | null;
  oemNo: string | null;
  remarks: string | null;
  costAccountID: number | null;
  brandID: number;
  printedRate: number | null;
  brandName: string;
  discountAmt: number | null;
  discountPerc: number | null;
  barCode: string | null;
  categoryID: number | null;
  qty: number;
  modelNo: string | null;
  sellingPrice: number;
}


export interface bankPopup{
  accontcode: string;
  accontname: string;
  id:number;
}

export interface receiptList{
  ID: number;
  TransactionNo: string;
  Date: string;
  Amount: string;
  Cancelled: string;
  EntryNo: string;
  EntryDate: string;
  AccountName: string;
  Phone: string;
  Status: string;
  SerialNo: string;
  VATNo: string;
}

export interface CostCentre{
  projectcode: number;
  projectname: string;
  id: string;
}
export interface Department {
  id: number;
  name: string;
}

