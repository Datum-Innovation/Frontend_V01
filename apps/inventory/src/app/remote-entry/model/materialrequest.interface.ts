export interface materialrequest
{
    transactionId:number;
    voucherNo:string;
    voucherDate:Date;
    description:string;
    branchAccount:PopUp;
    account:PopUp;
    reference:string;
    total:number;
    materialTransAddDto:MaterialTransAddDto;
    items:Items[];
    references:References[];
}
export interface PopUp
{
id:number;
name:string;
code:string;
description:string;
}
export interface MaterialTransAddDto
{
    mainBranch : DropDown;
    subBranch:DropDown;
    fromWarehouse:DropDown;
    toWarehouse:DropDown;
    terms:string;
}
export interface DropDown
{
id:number;
value:string;
}
export interface DropDownName
{
id:number;
name:string;
}
export interface Items
{
    transactionId:number;
    itemId:number;
    itemCode:string;
    itemName:string;
    location:string;
    batchNo:string;
    unit:Unit;
    qty:number;
    focQty:number;
    basicQty:number;
    additional:number;
    rate:number;
    otherRate:number;
    margin:number;
    rateDisc:number;
    grossAmt:number;
    discount:number;
    discountPerc:number;
    amount:number;
    taxValue:number;
    taxPerc:number;
    printedMRP: number;
    ptsRate: number;
    ptrRate: number;
    pcs: number;
    stockItemId: number;
    total: number;
    expiryDate: Date;
    description: string;
    lengthFt: number;
    lengthIn: number;
    lengthCm: number;
    girthFt: number;
    girthIn: number;
    girthCm: number;
    thicknessFt: number;
    thicknessIn: number;
    thicknessCm: number;
    remarks: string;
    taxTypeId: number;
    taxAccountId: number;
    costAccountId: number;
    brandId: number;
    profit: number;
    repairsRequired: string;
    finishDate: Date;
    updateDate: Date;
    replaceQty: number;
    printedRate: number;
    hsn: string;
    priceCategory:PopUp;
    sizeMaster:PopUp;
    avgCost: number;
    isReturn: boolean;
    manufactureDate:Date;
    uniqueItems:UniqueItems;
    tempRate: number;
    orderQty: number;
    refTransItemId: number
}
export interface Unit{
    unit:string;
    basicUnit:string;
    factor:number;
}
export interface UniqueItems
{
    uniqueNumber:string;
}
export interface References
{
    sel: boolean;
    addItem: boolean;
    voucherId: number;
    vNo: string;
    vDate: Date;
    referenceNo: string;
    accountId: number;
    accountName: string;
    amount: number;
    partyInvNo: string;
    partyInvDate: Date;
    id: number;
    voucherType: string;
    mobileNo: string;
    refItems:RefItems[];
}
export interface RefItems
{
    select: boolean,
    itemID: number,
    itemCode: string,
    itemName: string,
    unit: string,
    qty: number,
    rate: number,
    printedMRP: number,
    amount: number
}
export interface BranchAc
{
    accontCode: string;
    accontName: string;
    id:number;
}

