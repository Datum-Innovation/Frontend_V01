  export interface WAREHOUSEMASTERS {
    id:number;
    code: string;
    name: string;
  }
  

  export interface WAREHOUSEBYID {
    id: number;
    name: string;
    code: string;
    locationTypeID: number;
    locationType: string;
    address: string;
    remarks: string;
    clearingPerCFT: number | null;
    groundRentPerCFT: number | null;
    lottingPerPiece: number | null;
    lorryHirePerCFT: number | null;
}

export interface WAREHOUSEBRANCH {
    locationID: number;
    branchID: number;
    isDefault: boolean | null;
    active: boolean;
}

export interface WAREHOUSEVIEW {
    warehousebyid: WAREHOUSEBYID;
    warehousebranch: WAREHOUSEBRANCH[];
}

export interface WAREHOUSEMASTER {
    warehouseView: WAREHOUSEVIEW;
}

export interface WAREHOUSETYPES{
  id:number;
  name:string;
}

  

  