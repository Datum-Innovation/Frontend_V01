export interface Designations {
    id: number;
    name: string;
}

export interface Designation {
    id: number;
    name: string;
    createdBranchID: number;
    company:string,
    createdBy:number,
    createdOn:string,
    activeFlag:1
}
