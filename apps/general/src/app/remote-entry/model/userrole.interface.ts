  export interface USERROLES {
      id: number;
      role: string;
      createdOn: string;
      active: boolean;
    }

    interface Role {
      id: number;
      role: string;
      createdOn: string;
      active: boolean;
    }
    
    export interface ROLERIGHTS {
      id: number | null;
      roleId: number;
      pageName: string;
      moduleType: string;
      pageMenuId: number;
      isPage: number;
      isView: number | null;
      isCreate: number | null;
      isEdit: number | null;
      isCancel: number | null;
      isDelete: number | null;
      isApprove: number | null;
      isEditApproved: number | null;
      isHigherApprove: number | null;
      isPrint: number | null;
      isEmail: number | null;
    }
    
    export interface FILLROLEDATA {
      fillRole: Role;
      fillRoleRights: ROLERIGHTS[];
    }

