export interface CUSTOMERSUPPLIERS {
    id: number;
    code: string;
    name: string;
    accountID: number;
    imagePath: string;
    nature: string;
}

export interface CUSTOMERSUPPLIER {
    id: number;
    name: string;
    contactPerson: string | null;
    nature: string;
    addressLineOne: string | null;
    addressLineTwo: string | null;
    city: string | null;
    country: number;
    pobox: string | null;
    remarks: string | null;
    telephoneNo: string | null;
    mobileNo: string | null;
    emailAddress: string | null;
    faxNo: string | null;
    active: boolean;
    panNo: string | null;
    salesTaxNo: string | null;
    centralSalesTaxNo: string | null;
    salutation: string | null;
    contactPerson2: string | null;
    telephoneNo2: string | null;
    companyID: number;
    branchID: number;
    createdBy: number;
    createdOn: string;
    isMultiNature: boolean | null;
    imagePath: string;
    code: string;
    accountID: number;
    dL1: string | null;
    dL2: string | null;
    areaID: number;
    bulidingNo: string | null;
    district: string | null;
    province: string | null;
    countryCode: string | null;
    area: string;
    creditLimit: number | null;
    priceCategoryID: number | null;
    placeOfSupply: string;
    arabicName: string | null;
    salesManID: number | null;
    salesMan: string | null;
    partyCategoryID: number;
}

export interface CUSTOMERSUPPLIERTYPE {
    id: number;
    description: string;
}

export interface CUSTOMERSUPPLIERCATEGORIES {
    id: number;
    value: string;
}

export interface CUSTOMERPRICECATEGORIES {
    id: number;
    name: string;
}

export interface CUSTOMERCATEGORIES {
    id: number;
    name: string;
}

export interface CUSTOMERCOMMODITY {
    id: number;
    description: string;
    code: string;
}

export interface CUSTOMERCOUNTRIES {
    id: number;
    value: string;
}

export interface CREDITCOLLECTION {
    id: number;
    value: string;
    description: string;
}

export interface SALESMAN{
    id: number;
    name: string;
    code: string;
}

export interface AREA{
    id: number;
    name: string;
    code:string;
}

export interface ACCOUNTGROUP{
    id: number;
    name: string;
}

export interface ACCOUNT{
    id: number;
    date: string;
    name: string;
    narration: string | null;
    isGroup: boolean;
    subGroup: any; // Change the type if subGroup has a specific type
    accountCategory: number;
    parent: number;
    createdBy: number;
    createdBranchID: any; // Change the type if createdBranchID has a specific type
    createdOn: string;
    isBillWise: boolean;
    active: boolean;
    alias: string;
    accountTypeID: any; // Change the type if accountTypeID has a specific type
    sortField: number;
    level: number;
    finalAccount: boolean;
    accountGroup: number;
    systemAccount: boolean;
    preventExtraPay: any; // Change the type if preventExtraPay has a specific type
    alternateName: string;
}

export interface DELIVERYDETAILS{
    delId: number;
  locationName: string;
  projectName: string;
  contactPerson: string;
  contactNo: string;
  address: string;
}

export interface PLACEOFSUPPLY {
    id: number;
    value: string;
}






