export interface Keys {   
    Key: string;
}

export interface FillMaster{
    ID: number;    
    Key: string;
    Value: string;    
}

export interface SubMaster{
    ID: number;
    Key: string;
    Value: string;
    Description: string;
    Active: number;
    AllowDelete: number;
    DevCode: number;
    Code: string;
}