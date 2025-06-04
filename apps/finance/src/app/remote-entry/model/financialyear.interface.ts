export interface ALLFINANCIALYEAR {
  finYearID: number;
  finYearCode: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface FINANCIALYEAR {
  finYearID: number;
  finYearCode: string;
  startDate: string;
  endDate: string;
  status: string;
  lockTillDate: string;
  createdBranchID: number;
  createdBy: number;
  createdOn: string;
  activeFlag: number;
}


