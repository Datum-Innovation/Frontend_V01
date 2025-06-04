/* eslint-disable @typescript-eslint/no-explicit-any */


  export interface ACCOUNTPOPUP{
    alias: string;
    name: string;
    id: number;
  }

  export interface USERSPOP {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    emailId: string;
    mobileNumber: string;
  }
  
  export interface BRANCHES {
    id: number;
    company: string;
    nature: string;
  }
  export interface ACCOUNTGROUP {
    id: number;
    name: string;
    code: string;
    description: string;
  }
  
  export interface COSTCENTRE {
    id: number;
    name: string;
    code: string;
    description: string;
  }
  
  export interface FILTERCRITERIA {
    dateFrom: string;
    dateUpto: string;
    branch: BRANCHES;
    account: ACCOUNTPOPUP;
    user: USERSPOP;
    accountGroup: ACCOUNTGROUP;
    costCentre: COSTCENTRE;
  }
  
  export interface AccountPopup{
    alias:string,
    name:string,
    
    id:number
  }

  export interface VOUCHERTYPE{
    name:string,
    id:number
  }
  export interface REPORTDATA {
    [key: string]: any; 
    vid: number;           
    veid: number;          
    accountID: number;     
    refNo: string;         
    narration: string | null;
    particulars: string;   
    rBalance: number;      
    user: string;         
    vType: string;         
    vDate: string;         
    vNo: string;           
    commonNarration: string | null; 
    debit: number;         
    credit: number | null; 
  }
  export interface DETREPORTDATA {
    vDate: string;
    debit: number;
    credit: number;
    totalDebit?: number | null;
    totalCredit?:number | null; 
  }
  
  