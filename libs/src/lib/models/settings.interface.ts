  export interface GridSettings {
    id: number;                   
    formName:  {
      name: string
    },           
    gridName: string;           
    columnName: string;          
    originalCaption: string;     
    newCaption: string | null;    
    visible: boolean;             
    pageId: number;               
    branchId: number | null;      
    arabicCaption: string | null; 
    [key: string]: any;
  }
  
  export interface LabelSettings {
    id: number;
    formName:  {
      name: string
    }, 
    labelName: string;
    originalCaption: string;
    newCaption: string | null;
    visible: boolean;
    pageId: number;
    branchId: number | null;
    arabicCaption: string | null;
    enable: boolean | null;
    [key: string]: any;
  }

