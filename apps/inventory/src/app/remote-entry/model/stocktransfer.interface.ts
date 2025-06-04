

export interface BranchDto{
    id:number,
    value:string
}

export interface WarehouseDto{
    id:number,
    value:string
}

export interface Items {
    item:{
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
    },
    uniqueItem: string,
    expiryItem: {
      expiryPeriod: string,
      isExpiry: string
    },
    unitPopup: UnitPopupItem[];
  }

  interface UnitPopupItem {
    id: number;
    unit: string;
    basicUnit: string;
    factor: number;
    sellingPrice: number;
    purchaseRate: number;
    mrp: number;
  }

export interface StockItemDto{
    itemId:number,
    transactionId:number,
    itemCode:string,
    itemName:string,
    unit:UnitDto,
    qty:number,
    rate:number,
    stockQty:number|null,
    basicQty:number|null,
    amount:number,
    pcs:number|null,
    sizeMaster:SizeMasterDto|null,
    taxTypeId:number|null,
    taxPerc:number|null,
    taxValue:number|null,
    taxAccountId:number|null,
    uniqueItems:[UniqueItemDto] |null   
}

export interface UnitDto{
    unit:string,
    basicUnit:string,
    factor:number
}

export interface SizeMasterDto{
    id:number,
    name:string,
    code:string,
    description:string
}

export interface UniqueItemDto{
    uniqueNumber:string
}

export interface ReferenceDto{
    sel:boolean,
    addItem:boolean,
    voucherId:number,
    vNo:string,
    vDate:Date,
    referenceNo:string,
    accountId:number,
    accountName:string,
    amount:number,
    partyInvNo:string,
    partyInvDate:Date,
    id:number,
    voucherType:string,
    mobileNo:string|null,
    refItems:[RefItemsDto]|null
}
export interface RefItemsDto{
    select:boolean,
    itemID:number,
    itemCode:string,
    itemName:string,
    unit:string,
    qty:number,
    rate:number,
    printedMRP:number,
    amount:number
}