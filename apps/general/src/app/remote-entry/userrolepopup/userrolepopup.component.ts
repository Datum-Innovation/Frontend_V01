import { Component, Input, Output, Renderer2,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageMenu, UserRoles } from '../model/users.interface';
import { UsersService } from '../../services/users.service';
import { BaseService, EndpointConstant } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'dfinance-frontend-userrolepopup',
  templateUrl: './userrolepopup.component.html',
  styleUrls: ['./userrolepopup.component.css'],
})
export class UserrolepopupComponent {  
  @Input() maRoleId:number = 1;
  @Input() userRights:any = [];
  @Output() selectedUserRights = new EventEmitter<any>();
  userRoleForm!: FormGroup;
  showPopup = true;
  isLoading = false;
  allPageMenus = [] as Array<PageMenu>; 
  filteredContent = [] as Array<PageMenu>; 
  allUserRoles = [] as Array<UserRoles>;  
  destroySubscription: Subject<void> = new Subject<void>();
  searchTerm: string = '';
  selectAllIsViewChecked = false;
  selectAllIsCreateChecked = false;  
  selectAllIsEditChecked = false;
  selectAllIsCancelChecked = false;
  selectAllIsDeleteChecked = false;
  selectAllIsApproveChecked = false;
  selectAllisEditApprovedChecked = false;
  selectAllIsHigherApproveChecked = false;
  selectAllIsPrintChecked = false;
  selectAllIsEmailChecked = false;
  selectAllIsFrequentlyUsedChecked = false;
  selectAllIsPageChecked = false;
  selectAllChecked = false;

  constructor(
    private formBuilder: FormBuilder,      
    private usersService: UsersService,
    private renderer: Renderer2,    
    private datePipe: DatePipe,
    private baseService:BaseService) {
      
  }

  ngOnInit() {
    this.initializeForm();
    this.fetchUserRoles();
  }

  initializeForm(){
    this.userRoleForm = this.formBuilder.group({
      userrole: [this.maRoleId, Validators.required]
    });
    if(this.userRights){
      this.allPageMenus = this.userRights.map((item:any) => Object.assign({}, item));
      this.filteredContent = this.allPageMenus;
    }
  }

  fetchUserRoles(): void {
    this.isLoading = true;
    this.usersService
    .getDetails(EndpointConstant.FILLROLEDROPDOWN)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.allUserRoles = response?.data;   
             
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchUserRoleById(roleid:number): void {
    this.isLoading = true;
    this.usersService
    .getDetails(EndpointConstant.FILLROLEBYID+roleid)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.allPageMenus = response?.data;
        this.filteredContent = this.allPageMenus;      
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  updateFilter(event: any) {
    const inputVal = event.target.value.toLowerCase();
    this.searchTerm = inputVal;
    // Custom filter function to search based on two columns
    this.filterUserRights(inputVal);
    
  }

  filterUserRights(inputVal:string){
    this.filteredContent = this.allPageMenus.filter(row => {
      return (row.pageName.toLowerCase().includes(inputVal) || row.moduleType.toLowerCase().includes(inputVal));
    });
  }

  onClickOk() {
    this.renderer.setStyle(document.body, 'overflow', 'auto');
    this.showPopup = false;  
    const OutputObject = {
      "maRoleId":this.maRoleId,
      "pageMenus":this.allPageMenus
    }
    this.selectedUserRights.emit(OutputObject);
   
  }

  onClickCancel(){    
    this.renderer.setStyle(document.body, 'overflow', 'auto');
    this.allPageMenus = [];
    this.filteredContent = []
    this.showPopup = false; 

    this.selectedUserRights.emit(null);
  }
  onUserRoleSelect(){
    if(this.maRoleId != 0){      
      const confirmed = window.confirm('Role information will be cleared');
      if (confirmed) {        
      this.maRoleId = this.userRoleForm.value.userrole;
        this.fetchUserRoleById(this.maRoleId);
      } else {
   
      }
    } else{      
      this.maRoleId = this.userRoleForm.value.userrole;
      this.fetchUserRoleById(this.maRoleId);
    }
  }

  getRowHeight(row: any) {
    return 50; // Example height (adjust as needed)
  }

  selectAllCheckboxes(columnname: string) {
    let checkedStatus = this.switchCheckbox(columnname);
  
    if (columnname === 'all') {
      this.allPageMenus.forEach((row: any) => {
        row.isView = checkedStatus; 
        row.isCreate = checkedStatus; 
        row.isEdit = checkedStatus; 
        row.isCancel = checkedStatus; 
        row.isDelete = checkedStatus; 
        row.isApprove = checkedStatus; 
        row.isEditApproved = checkedStatus; 
        row.isHigherApprove = checkedStatus; 
        row.isPrint = checkedStatus; 
        row.isEmail = checkedStatus; 
        row.frequentlyUsed = checkedStatus; 
        row.isPage = checkedStatus; 
      });
    } else{
      this.allPageMenus.forEach((row: any) => row[columnname] = checkedStatus);
    }
    this.filterUserRights(this.searchTerm);
    //this.filteredContent = this.allPageMenus;
  }

  switchCheckbox(columnname: string) {
    switch (columnname) {
      case 'isView':
        return this.selectAllIsViewChecked = !this.selectAllIsViewChecked;
      case 'isCreate':
        return this.selectAllIsCreateChecked = !this.selectAllIsCreateChecked;
      case 'isEdit':
        return this.selectAllIsEditChecked = !this.selectAllIsEditChecked;
        case 'isCancel':
        return this.selectAllIsCancelChecked = !this.selectAllIsCancelChecked;
      case 'isDelete':
        return this.selectAllIsDeleteChecked = !this.selectAllIsDeleteChecked;
      case 'isApprove':
        return this.selectAllIsApproveChecked = !this.selectAllIsApproveChecked;
      case 'isEditApproved':
        return this.selectAllisEditApprovedChecked = !this.selectAllisEditApprovedChecked;
      case 'isHigherApprove':
        return this.selectAllIsHigherApproveChecked = !this.selectAllIsHigherApproveChecked;
      case 'isPrint':
        return this.selectAllIsPrintChecked = !this.selectAllIsPrintChecked;
      case 'isEmail':
        return this.selectAllIsEmailChecked = !this.selectAllIsEmailChecked;
      case 'isFrequentlyUsed':
        return this.selectAllIsFrequentlyUsedChecked = !this.selectAllIsFrequentlyUsedChecked;
      case 'isPage':
        return this.selectAllIsPageChecked = !this.selectAllIsPageChecked;
      case 'all':
        return this.selectAllChecked = !this.selectAllChecked;
      default:
        return false;
    }
  }

  selectRow(event: any, rowIndex: number) {   
    const isChecked = event.target.checked;
    this.allPageMenus[rowIndex]['isView'] = isChecked;
    this.allPageMenus[rowIndex]['isCreate'] = isChecked;
    this.allPageMenus[rowIndex]['isEdit'] = isChecked;
    this.allPageMenus[rowIndex]['isCancel'] = isChecked;
    this.allPageMenus[rowIndex]['isDelete'] = isChecked;
    this.allPageMenus[rowIndex]['isApprove'] = isChecked;
    this.allPageMenus[rowIndex]['isEditApproved'] = isChecked;
    this.allPageMenus[rowIndex]['isHigherApprove'] = isChecked;
    this.allPageMenus[rowIndex]['isPrint'] = isChecked;
    this.allPageMenus[rowIndex]['isEmail'] = isChecked;
    this.allPageMenus[rowIndex]['frequentlyUsed'] = isChecked;
    this.allPageMenus[rowIndex]['isPage'] = isChecked;
    this.filterUserRights(this.searchTerm);
    //this.filteredContent = this.allPageMenus;
  }

  onChangeSingleRight(event: any, fieldName: string, rowIndex: number) {   
    const isChecked = event.target.checked;
    this.allPageMenus[rowIndex][fieldName] = isChecked;
    this.filterUserRights(this.searchTerm);
    //this.filteredContent = this.allPageMenus; 
  }
  
}
