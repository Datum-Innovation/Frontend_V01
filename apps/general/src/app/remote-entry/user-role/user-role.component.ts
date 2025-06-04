import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService} from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRoleService } from '../../services/userrole.service';
import { FILLROLEDATA, ROLERIGHTS, USERROLES } from '../model/userrole.interface';
import { DatePipe } from '@angular/common';

declare var $: any;
@Component({
  selector: 'dfinance-frontend-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.css'],
})
export class UserRoleComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  userRoleForm!: FormGroup;    
  allUserRoles = [] as Array<USERROLES>; 
  allUserRights:any = [] as Array<ROLERIGHTS>;
  selectedUserRoleId!: number;
  firstUserRole!:number;
  active: boolean = false;
  isGroup: boolean = false;
  currentUserRole = {} as FILLROLEDATA;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false; 
 
  isLoading = false;

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

  initialUserRights:any = [] as Array<ROLERIGHTS>;

  pageId = 0;
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  constructor(
    private formBuilder: FormBuilder,    
    private userRoleService: UserRoleService,
    private store: Store,
    private router:Router,    
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private baseService:BaseService
  ){
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];      
      this.fetchMenuDataPermissions();
    }
  }

  ngOnInit(): void {
    this.userRoleForm = this.formBuilder.group({      
      role:[{value:'',disabled:this.isInputDisabled}, Validators.required],
      active:[{value:true,disabled:this.isInputDisabled}]
    });
    this.fetchAllUserRoles();
    this.fetchuserrights();
  }

  setInitialState(){
    this.isNewBtnDisabled = false;
    this.isEditBtnDisabled = false;
    this.isDeleteBtnDisabled = false; 
    this.isSaveBtnDisabled = true; 
    this.isInputDisabled = true;
    this.isUpdate = false;
    this.disbaleFormControls();
  }

  fetchMenuDataPermissions(){
    let menuData = this.menudataService.getMenuDataFromStorage(Number(this.pageId));
    this.isView = menuData.isView;
    this.isCreate = menuData.isCreate;
    this.isEdit = menuData.isEdit;
    this.isDelete = menuData.isDelete;
    this.isCancel = menuData.isCancel;
    this.isEditApproved = menuData.isEditApproved;
    this.isHigherApproved = menuData.isHigherApproved;
  }

  fetchAllUserRoles(): void {
    this.userRoleService
    .getDetails(EndpointConstant.FILLALLUSERROLES)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allUserRoles = response?.data;
        this.selectedUserRoleId = this.allUserRoles[0].id;
        this.firstUserRole = this.allUserRoles[0].id;
        this.fetchUserRoleById();
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchuserrights(): void {
    this.userRoleService
    .getDetails(EndpointConstant.FILLUSERROLEBYID  +'0')
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allUserRights = response?.data.fillRoleRights;
        this.initialUserRights = [...this.allUserRights];
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }
  
  onClickUserRole(event:any): void {
    if (event.type === 'click') {
      this.selectedUserRoleId = event.row.id;console.log(this.selectedUserRoleId);console.log(event.row);
      this.fetchUserRoleById();
    }
  }

  fetchUserRoleById(): void {
    this.userRoleService
    .getDetails(EndpointConstant.FILLUSERROLEBYID  +this.selectedUserRoleId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentUserRole = response?.data;
        let userrole = this.currentUserRole.fillRole;
        this.allUserRights = this.currentUserRole.fillRoleRights;
        this.userRoleForm.patchValue({
          role: userrole.role,
          active: userrole.active,
        });
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }


  onClickNewUserRoles(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.userRoleForm.reset();    
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedUserRoleId = this.firstUserRole;
      this.fetchUserRoleById();
    } else{
      this.selectedUserRoleId = 0;
      this.enableFormControls();
      this.allUserRights = this.initialUserRights;
    }
    return true;
  }

  onClickEditUserRole(){
    if(!this.isEdit){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;    
    if(this.isInputDisabled == false){
      this.enableFormControls();
    } else{
      this.disbaleFormControls();
    }
    this.fetchUserRoleById();
    return true;
  }

  onClickDeleteUserRole(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
     
      this.userRoleService.deleteDetails(EndpointConstant.DELETEUSERROLE+this.selectedUserRoleId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(response.httpCode == 500){
            this.baseService.showCustomDialogue(response.data.msg);
          }
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue(response.data);          
            this.selectedUserRoleId = this.firstUserRole;
            this.fetchAllUserRoles();
            this.setInitialState();
          }          
        },
        error: (errormsg) => {
          console.log(errormsg);
          this.isLoading = false;
        },
      });
    }
    return true;
  }

  onClickSaveUserRole() {
    if (this.userRoleForm.invalid) {
      for (const field of Object.keys(this.userRoleForm.controls)) {
        const control: any = this.userRoleForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    let rolerightArray:any = [];console.log(this.allUserRights);
    this.allUserRights.forEach((item:any) => {
      let userRightObj = {
          "roleId": item.roleId,
          "pageMenuId": item.pageMenuId,
          "isView": item.isView ? item.isView : false,
          "isCreate": item.isCreate ? item.isCreate : false,
          "isEdit": item.isEdit ? item.isEdit : false,
          "isCancel": item.isCancel ? item.isCancel : false,
          "isDelete": item.isDelete ? item.isDelete : false,
          "isApprove": item.isApprove ? item.isApprove : false,
          "isEditApproved": item.isEditApproved ? item.isEditApproved : false,
          "isHigherApprove": item.isHigherApprove ? item.isHigherApprove : false,
          "isPrint": item.isPrint ? item.isPrint : false,
          "isEmail": item.isEmail ? item.isEmail : false
      };
      rolerightArray.push(userRightObj);
    });
    const payload = {
      "id":this.isUpdate ? this.selectedUserRoleId : 0,
      "role": this.userRoleForm.value.role,
      "active": this.userRoleForm.value.active ? true : false,
      "rolerightDto":rolerightArray
    };

    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.userRoleService.updateDetails(EndpointConstant.UPDATEUSERROLE,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(response.httpCode == 500){
            this.baseService.showCustomDialogue(response.data.msg);
          }
          if(response.httpCode == 201){
            this.baseService.showCustomDialogue(response.data);          
            this.selectedUserRoleId = this.firstUserRole;
            this.fetchUserRoleById();
            this.fetchAllUserRoles();
            this.setInitialState();
           
          }          
        },
        error: (errormsg) => {
          console.log(errormsg);
          this.isLoading = false;
        },
      });
  }

  createCallback(payload:any){    
    this.userRoleService.saveDetails(EndpointConstant.SAVEUSERROLE,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(response.httpCode == 500){
            this.baseService.showCustomDialogue(response.data.msg);
          }
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue('Successfully saved user role'); 
            this.selectedUserRoleId = this.firstUserRole;
            this.fetchUserRoleById();
            this.fetchAllUserRoles();
            this.setInitialState();
          }     
        },
        error: (errormsg) => {
          console.log(errormsg);
          this.isLoading = false;
        },
      });
  }

  
  selectAllCheckboxes(columnname: string) {
    let checkedStatus = this.switchCheckbox(columnname);
  
    // if (columnname === 'all') {
    //   this.allUserRights.forEach((row: any) => {
    //     row.isView = checkedStatus; 
    //     row.isCreate = checkedStatus; 
    //     row.isEdit = checkedStatus; 
    //     row.isCancel = checkedStatus; 
    //     row.isDelete = checkedStatus; 
    //     row.isApprove = checkedStatus; 
    //     row.isEditApproved = checkedStatus; 
    //     row.isHigherApprove = checkedStatus; 
    //     row.isPrint = checkedStatus; 
    //     row.isEmail = checkedStatus; 
    //     row.frequentlyUsed = checkedStatus; 
    //     row.isPage = checkedStatus; 
    //   });
    // } else{
      this.allUserRights.forEach((row: any) => row[columnname] = checkedStatus);
   // }
   // this.filterUserRights(this.searchTerm);
    //this.filteredContent = this.allUserRights;
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
      // case 'all':
      //   return this.selectAllChecked = !this.selectAllChecked;
      default:
        return false;
    }
  }

  selectRow(event: any, rowIndex: number) {   
    const isChecked = event.target.checked;
    this.allUserRights[rowIndex]['isView'] = isChecked;
    this.allUserRights[rowIndex]['isCreate'] = isChecked;
    this.allUserRights[rowIndex]['isEdit'] = isChecked;
    this.allUserRights[rowIndex]['isCancel'] = isChecked;
    this.allUserRights[rowIndex]['isDelete'] = isChecked;
    this.allUserRights[rowIndex]['isApprove'] = isChecked;
    this.allUserRights[rowIndex]['isEditApproved'] = isChecked;
    this.allUserRights[rowIndex]['isHigherApprove'] = isChecked;
    this.allUserRights[rowIndex]['isPrint'] = isChecked;
    // this.allUserRights[rowIndex]['isEmail'] = isChecked;
    // this.allUserRights[rowIndex]['frequentlyUsed'] = isChecked;
    // this.allUserRights[rowIndex]['isPage'] = isChecked;
    //this.filterUserRights(this.searchTerm);
    //this.filteredContent = this.allUserRights;
  }

  onChangeSingleRight(event: any, fieldName: string, rowIndex: number) {   
    const isChecked = event.target.checked;
    this.allUserRights[rowIndex][fieldName] = isChecked;
    //this.filterUserRights(this.searchTerm);
    //this.filteredContent = this.allUserRights; 
  }

  enableFormControls(){
    this.userRoleForm.get('role')?.enable();
    this.userRoleForm.get('active')?.enable();

  }

  disbaleFormControls(){
    this.userRoleForm.get('role')?.disable();
    this.userRoleForm.get('active')?.disable();
  }

  ngAfterViewInit(): void {
    this.setMaxHeight();
    this.isOverlayVisible = !!this.overlayElement.nativeElement;
   if(this.isOverlayVisible){
    this.adjustOverlayHeight();
   }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
  }

  setMaxHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer
    
    const availableHeight = window.innerHeight - headerHeight - footerHeight - 90;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight - 30;
    
    const sections = document.querySelectorAll('.right-section');
    sections.forEach(section => {
      (section as HTMLElement).style.height = `${availableHeight}px`;
    });
    
    const leftsection = document.querySelectorAll('.ngx-datatable.scroll-vertical');
    leftsection.forEach(section => {
      (section as HTMLElement).style.setProperty('height', `${leftContentHeight}px`, 'important');
    });
  }

  adjustOverlayHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
    //this.overlayElement.nativeElement.style.height = `${leftContentHeight}px`;
  }
  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    // Destroy DataTables when the component is destroyed
    // if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
    //   $(this.table.nativeElement).DataTable().destroy();
    // }
  }
}
