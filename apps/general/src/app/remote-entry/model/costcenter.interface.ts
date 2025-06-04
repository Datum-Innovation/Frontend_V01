export interface CostCategories {
    id: number;
    name: string;
    description:string;
}

export interface CostCategory {
    id: number;
    name: string;
    description:string;
    allocateRevenue:string;
    allocateNonRevenue:string;
    active:string;
}

export interface CostCenters {
    id: number;
    code: string;
    description:string;
}

export interface CostCenter {
    id: number;
    code: string;
    description: string;
    active: string;
    pType: string;
    type: string;
    serialNo: string;
    regNo: string;
    supplierName: string;
    supplierID: string;
    supplierCode: string;
    clientName: string;
    clientID: string;
    clientCode: string;
    staffIDName: string;
    staffID: string;
    staffIDCode: string;
    staffID1Name: string;
    staffID1: string;
    staffID1Code: string;
    status: string;
    remarks: string;
    rate: string;
    sDate: string;
    make: string;
    mYear: string;
    eDate: string;
    contractValue: string;
    invoicedAmt: string;
    isPaid: string;
    site: string;
    parentID: string;
    isGroup: string;
    costCategoryID: number;
    categoryName: string;
    parentName: string;
}

export interface CreateUnder {
    id: number;
    name: string;
}

export interface Nature{
    value:number,
    name:string
}

export interface CostCentreStatus{
    id:number;
    value:string;
}

export interface ConsultancyDropdown{
    id:number;
    code:string;
    name:string;
}

export interface ClientDropdown{
    id:number;
    code:string;
    name:string;
}

export interface StaffDropdown{
    id:number;
    code:string;
    name:string;
}
