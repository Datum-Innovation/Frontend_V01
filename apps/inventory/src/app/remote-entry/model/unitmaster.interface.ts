  export interface UNITMASTERS {
    unit: string;
    description: string;    
  }

  export interface UNITMASTER{
    unit: string;
    description: string;
    factor: number;
    isComplex: boolean;
    basicUnit: string;
    allowDelete: boolean;
    precision: number;
    active: boolean;
    arabicName: string;    
  }

  export interface BASICUNIT {
    id: number;
    unit: string;
    factor: number;
  }

  

  