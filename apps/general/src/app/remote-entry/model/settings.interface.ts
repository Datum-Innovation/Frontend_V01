  export interface SETTINGS {
      id: number;
      key: string;
      value: string;
  }

  export interface SINGLESETTING {
    id: number;
    key: string;
    value: string;
    description: string;
    systemSetting: any | null;
  }
