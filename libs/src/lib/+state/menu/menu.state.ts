// menu.state.ts

export interface MenuState {
    menuItems: MenuItem[];
    error:any;
  }

  export interface MenuItem {
    id: number;
    menuText:string,
    menuValue:string,
    url:string
    parentID:number,
    isPage:boolean,
    voucherID:string,
    shortcutKey:string,
    toolTipText:string,
    isView:boolean,
    isCreate:boolean,
    isCancel:boolean,
    isApprove:boolean,
    isEditApproved:boolean,
    isHigherApprove:boolean,
    isPrint:boolean,
    isEmail:string,
    submenu?: MenuItem[]
  }
  