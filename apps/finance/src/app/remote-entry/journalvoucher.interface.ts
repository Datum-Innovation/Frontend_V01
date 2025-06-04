export interface Master {
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

export interface ACCOUNTDETAILS {
  accountCode: string;
  accountName: string;
  details: string;
  id: number;
  isBillWise: boolean;
  isCostCentre: boolean;
}

export interface AccountData {
  accountCode: string;
  accountName: string;
  id: number;
}

export interface Currency {
  currencyID: number;
  abbreviation: string;
  currencyRate: number;
  defaultCurrency: boolean;
  precision: number;
  culture: string;
  formatString: string;
}

export interface Projects {
  projectcode: number;
  projectname: string;
  id: string;
}

export interface AccountDataDto {
  accountCode: AccountCodeDto;
  description: string;
  dueDate: Date | null;
  amount: number | null;
  debit: number | null;
  credit: number | null;
  billandRef: BillsAndRefDto[]
  //billandRef:[BillsAndRefDto]|null;
}

export interface AccountCodeDto {
  id: number;
  code: string;
  name: string;
  description: string;
}
export interface BillsAndRefDto {
  selection: boolean;
  invoiceNo: string;
  invoiceDate: Date;
  partyInvNo: number;
  partyInvDate: Date;
  description: string;
  account: string;
  invoiceAmount: number;
  allocated: number;
  amount: number;
  balance: number;
  vid: number;
  veid: number;
  accountID: number;
}

export interface FinanceFillById {
  transaction: {
    fillTransactions: FillTransactions,
    fillAdditionals: fillTransactionAdditional,
    fillTransactionEntries: FillTransactionEntries,
    fillVoucherAllocationUsingRef: string | null,
    fillCheques: FillCheques | null,
    fillTransCollnAllocations: string | null,
    fillDocuments: string | null,
    fillTransactionExpenses: string | null,
    fillDocumentRequests: string | null,
    fillDocumentReferences: string | null,
    fillTransactionReferences: string | null,
    fillTransLoadSchedules: string | null,
    fillTransCollections: string | null,
    fillTransEmployees: string | null,
    vMFuelLog: string | null,
    fillDocumentImages: string | null,
    fillHRFinalSettlement: string | null,
    fillTransCostAllocations: string | null
  },

}
export interface FillTransactions {
  id: number;
  date: string;
  effectiveDate: string;
  voucherID: number;
  serialNo: number;
  transactionNo: string;
  isPostDated: boolean;
  currencyID: number;
  exchangeRate: number;
  refPageTypeID: any;
  refPageTableID: any;
  referenceNo: any;
  companyID: number;
  finYearID: any;
  instrumentType: any;
  instrumentNo: any;
  instrumentDate: any;
  instrumentBank: any;
  commonNarration: any;
  addedBy: number;
  approvedBy: any;
  addedDate: string;
  approvedDate: any;
  approvalStatus: any;
  approveNote: any;
  action: any;
  statusID: number;
  isAutoEntry: boolean;
  posted: boolean;
  active: boolean;
  cancelled: boolean;
  accountID: number;
  accountCode: string;
  accountName: string;
  description: any;
  status: string;
  createdEmployee: string;
  approvedEmployee: any;
  editedEmployee: any;
  currency: string;
  refTransID: any;
  refCode: any;
  costCentreID: any;
  projectCode: any;
  projectName: any;
  costCategoryID: any;
  allocateRevenue: any;
  allocateNonRevenue: any;
  pageID: number;
  accountNameArabic: any;
}

export interface FillTransactionEntries {
  id: number;
  transactionId: number;
  drCr: string;
  nature: any;
  accountId: number;
  dueDate: any;
  alias: number;
  name: string;
  amount: number;
  debit: number;
  credit: any;
  fcAmount: number;
  bankDate: any;
  refPageTypeID: any;
  currencyId: number;
  exchangeRate: number;
  refPageTableId: any;
  referenceNo: any;
  description: any;
  tranType: string;
  isBillWise: any;
  refTransId: any;
  taxPerc: any;
  valueOfGoods: number;
}

export interface fillTransactionAdditional {
  transactionID: number;
  refTransID1: number | null;
  refTransID2: number | null;
  typeID: number | null;
  modeID: number;
  measureTypeID: number | null;
  loadMeasureTypeID: number | null;
  consignTermID: number | null;
  fromLocationID: number | null;
  toLocationID: number;
  exchangeRate1: number | null;
  advanceExRate: number | null;
  customsExRate: number | null;
  approvalDays: number | null;
  workflowDays: number | null;
  postedBranchID: number | null;
  shipBerthDate: string | null;
  isBit: boolean | null;
  name: string | null;
  code: string | null;
  address: string;
  rate: number | null;
  systemRate: number;
  period: string | null;
  days: number | null;
  lcOptionID: number | null;
  lcNo: string;
  lcAmt: number | null;
  availableLCAmt: number | null;
  creditAmt: number | null;
  marginAmt: number;
  interestAmt: number | null;
  availableAmt: number;
  allocationPerc: number;
  interestPerc: number;
  tolerencePerc: number;
  countryID: number | null;
  country: string | null;
  countryOfOriginID: number | null;
  maxDays: number | null;
  documentNo: string | null;
  documentDate: string | null;
  beMaxDays: number | null;
  entryDate: string | null;
  entryNo: string | null;
  applicationCode: string | null;
  bankAddress: string | null;
  unit: string | null;
  amount: number | null;
  acceptDate: string | null;
  expiryDate: string | null;
  dueDate: string | null;
  openDate: string | null;
  closeDate: string | null;
  startDate: string | null;
  endDate: string | null;
  clearDate: string | null;
  receiveDate: string | null;
  submitDate: string | null;
  endTime: string | null;
  handOverTime: string | null;
  lorryHireRate: number | null;
  qtyPerLoad: number | null;
  passNo: string | null;
  referenceDate: string | null;
  referenceNo: string | null;
  auditNote: string | null;
  terms: string | null;
  firmID: number | null;
  vehicleID: number | null;
  weekDays: string | null;
  bankWeekDays: string | null;
  recommendByID: number | null;
  recommendDate: string | null;
  recommendNote: string | null;
  recommendStatus: string | null;
  isHigherApproval: boolean | null;
  lcApplnTransID: number | null;
  inLocID: number;
  outLocID: number | null;
  exchangeRate2: number | null;
  lcAppNo: string | null;
  lcOptionCode: string | null;
  fromLocation: string | null;
  saleSite: string | null;
  locTypeID: number | null;
  refCode: string | null;
  refCode1: string | null;
  accountID: number | null;
  routeID: number | null;
  accountID2: number | null;
  accountName: string;
  vehicleName: string | null;
  account2Name: string | null;
  hours: number | null;
  year: number | null;
  areaID: number | null;
  otherBranchID: number | null;
  branchName: string | null;
  area: string | null;
  taxFormID: number | null;
  priceCategoryID: number | null;
  priceCategory: string | null;
  isClosed: boolean;
  departmentID: number | null;
  department: any;
  partyName: string | null;
  address1: string | null;
  address2: string | null;
  itemID: number | null;
  itemName: string | null;
  equipMentName: string | null;
  vatNo: string;
}

export interface FillCheques {
  id: number;
  chequeDate: Date,
  chequeNo: string | null,
  clrDays: any | null,
  bankID: number | null,
  bankName: string | null,
  partyID: number | null,
  transactionId: number,
  chqAmount: number | null,
  pdcPayable: string | null,
  pdcAccountId: number | null,
  veid: number | null,
  description: string | null,
  tranType: string | null,
  cardType: string | null
}

export interface BillsAndRef {
  vid: number;
  veid: number;
  vNo: string;
  vDate: Date;
  description: string;
  billAmount: number;
  amount: number;
  accountID: number;
  selection: boolean;
  allocated: number;
  account: string;
  partyInvNo: number;
  partyInvDate: Date;
}

export interface Department {
  id: number;
  name: string;
}

export interface CardPopup {
  alias: string;
  name: string;
  id: number;
}

export interface ChequePopup {
  alias: string;
  name: string;
  id: number;
}

export interface EpayPopup {
  alias: string;
  name: string;
  id: number;
}

export interface bankPopup {
  accontcode: string;
  accontname: string;
  id: number;
}

export interface fillBillAndRef {
  id: number,
  vid: number,
  veid: number,
  vNo: string,
  vDate: Date,
  description: string,
  billAmount: number,
  amount: number,
  accountID: number,
  selection: number,
  allocated:number,
  account: string,
  refTransID: number
}
