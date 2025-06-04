import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService, minLengthValidator, selectToken } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountPopup, EmployeeType, PettyCash, Supervisor, UserData, Users, Warehouse } from '../model/users.interface';
import { UsersService } from '../../services/users.service';
import { Designations } from '../model/designation.interface';
import { Branches, DepartmentPopup } from '../model/branch.interface';
import { DatePipe } from '@angular/common';

declare var $: any;
@Component({
  selector: 'dfinance-frontend-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent {

  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('scrollableDivLeft') scrollableDivLeft!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  usersForm!: FormGroup;    
  allUsers = [] as Array<Users>; 
  allDesignations = [] as Array<Designations>; 
  allAccounts = [] as Array<AccountPopup>;
  currentMaRoleID = 0;
  employeeType:EmployeeType[] = [
    {
    "value":1,
    "name":"Employee"
    },
    {
    "value":0,
    "name":"External Service Provider"
    }];
  selectedUserId!: number;
  firstUser!:number;
  isActive: number = 0;
  currentUser = {} as UserData;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;  
  isLocationRestrictedUser: boolean = false;    
  accountOptions:any = [];  
  departmentOptions:any = [];  
  branchOptions:any = [];
  supervisorOptions:any = [];
  departmentData = [] as Array<DepartmentPopup>;
  branchData = [] as Array<Branches>;
  supervisorData = [] as Array<Supervisor>;
  departmentValue = "";
  branchValue = "";
  allBranchDetails: any[] = [];
  editBranchDetails:any[] = [];
  allUserRights: any[] = [];
  currentBranchTableIndex: number | null = null;
  showUserRolePopup = false;
  currentBranchDetailsIndex: number =0;
  selectedAccountId: number = 0;
  selectedAccountName: string = "";
  accountreturnField:string = 'name';
  accountKeys = ['Account Code','Account Name','ID'];
  departmentreturnField:string = 'name';
  departmentKeys = ['ID','Department Name'];
  branchreturnField:string = 'company';
  branchKeys = ['Company','ID'];
  supervisorreturnField:string = 'name';
  supervisorKeys = ['Name','ID'];

  imageData: string | ArrayBuffer | null = null;
  showImageContainer = true;

  pettycashData = [] as Array<PettyCash>;
  warehouseData = [] as Array<Warehouse>;
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
    private usersService: UsersService,
    private store: Store,
    private router:Router,
    private datePipe: DatePipe,
    private renderer: Renderer2,
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
    this.usersForm = this.formBuilder.group({
      firstName: [{value:'',disabled:this.isInputDisabled}, [Validators.required,this.noSpecialCharactersValidator()]],
      middleName: [{value:'',disabled:this.isInputDisabled}, [this.noSpecialCharactersValidator()]],
      lastName: [{value:'',disabled:this.isInputDisabled}, [Validators.required,this.noSpecialCharactersValidator()]],
      address: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      emailId: [{value:'',disabled:this.isInputDisabled}, [Validators.required,Validators.email]],
      residenceNumber: [{value:'',disabled:this.isInputDisabled}],
      officeNumber: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      mobileNumber: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      designationId: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      active: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      employeeType: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      username: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      password: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      pettycash: [{value:'',disabled:this.isInputDisabled}],
      warehouse: [{value:'',disabled:this.isInputDisabled}],
      gmailId: [{value:'',disabled:this.isInputDisabled}, [Validators.required,Validators.email]],
      isLocationRestrictedUser: [{value:'',disabled:this.isInputDisabled}],
      photoId: [{value:'',disabled:this.isInputDisabled}],
      imagePath: [{value:'',disabled:this.isInputDisabled}],
      employeeId: [{value:'',disabled:this.isInputDisabled}],
      departmentId: [{value:'',disabled:this.isInputDisabled}],
      createdOn: [{value:'',disabled:this.isInputDisabled}]
    });

    this.fetchAllUsers();
    this.fetchAllDesignations();
    this.fetchAccountDropdown();
    this.fetchDepartmentDropdown();
    this.fetchBranchDropdown();
    this.fetchSupervisorDropdown();
    this.fetchPettyCashList();
    this.fetchWareHouseDropdown();
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

  addRow(clicknew = false) {
    this.currentMaRoleID = 0;
    //checking department is empty or not....
    if(this.checkFieldEmpty('departmentId') && clicknew){
      this.baseService.showCustomDialogue('Please fill department');
      return false;
    }
    //checking branchname is empty or not....
    if(this.checkFieldEmpty('branchName') && clicknew){
      this.baseService.showCustomDialogue('Please fill branchName');
      return false;
    }

    //checking supervisorId is empty or not....
    if(this.checkFieldEmpty('supervisorId') && clicknew){
      this.baseService.showCustomDialogue('Please fill supervisorId');
      return false;
    }

    this.allBranchDetails.push({
      id: 0,
      employeeID: 0,
      branchID: 0,
      branchName: "",
      employeeName: "",
      departmentName: "",
      departmentID: 0,
      createdBy: 0,
      createdOn: new Date().toISOString().slice(0, 23) + 'Z',
      activeFlag: false,
      isMainBranch: false,
      supervisorID: 0,
      firstName:"",
      maRoleID: this.currentMaRoleID,
      mapagemenuDto:[]
    });
    this.currentBranchTableIndex = this.allBranchDetails.length - 1;
    this.allBranchDetails = [...this.allBranchDetails];
    return true;
  }

  checkFieldEmpty(key:any){
    for (const obj of this.allBranchDetails) {
      if (obj[key] == "" ) {
          return true; // Key is null in at least one object
      }
    }
    return false;
  }

  onClickActiveFlag(event: any, row: any, rowIndex: number) {   
    const isChecked = event.target.checked;
    this.allBranchDetails[rowIndex].activeFlag = isChecked ? 1 : 0;
    // if(this.currentBranchTableIndex == rowIndex){
    //   this.addRow();
    // }
  }

  onClickMainBranch(event: any, row: any, rowIndex: number) {
    const isChecked = event.target.checked;
    if(isChecked == true){
      for (const obj of this.allBranchDetails) {
        if (obj['isMainBranch'] == true ) {
          obj['isMainBranch'] = false;
        }
      }
    }
    this.allBranchDetails[rowIndex].isMainBranch = isChecked;
    
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

  fetchAllUsers(): void {
    //this.isLoading = true;
    this.usersService
    .getDetails(EndpointConstant.FILLALLUSERS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.allUsers = response?.data;
        //this.setBranches();
        this.selectedUserId = this.allUsers[0].id;
        this.firstUser = this.allUsers[0].id;
        this.fetchUserById();
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchAllDesignations(): void {
    //this.isLoading = true;
    this.usersService
    .getDetails(EndpointConstant.FILLALLDESIGNATIONS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.allDesignations = response?.data;
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchAccountDropdown(): void {
    //this.isLoading = true;
    this.usersService
    .getDetails(EndpointConstant.FILLACCOUNTPOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.allAccounts = response?.data;
        this.accountOptions = this.allAccounts.map((item:any) => item.name);
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchDepartmentDropdown(): void {
    this.usersService
    .getDetails(EndpointConstant.DEPARTMENTPOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.departmentData = response?.data;
        this.departmentOptions = this.departmentData.map((item:any) => item.name);
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }


  fetchBranchDropdown(): void {
    this.usersService
    .getDetails(EndpointConstant.FILLALLBRANCH)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.branchData = response?.data;
        this.branchOptions = this.branchData.map((item: any) => ({
          company: item.company,
          id: item.id
        }));

      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchSupervisorDropdown(): void {
    this.usersService
    .getDetails(EndpointConstant.USERDROPDOWN)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.supervisorData = response?.data;
        this.supervisorOptions = this.supervisorData.map((item: any) => ({
          name: item.name,
          id: item.id
        }));

      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchPettyCashList(): void {
    this.usersService
    .getDetails(EndpointConstant.FILLPETTYCASH)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.pettycashData = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchWareHouseDropdown(): void {
    this.usersService
    .getDetails(EndpointConstant.FILLWAREHOUSEDROPDOWN)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.warehouseData = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  onAccountSelected(option: string): any {    
    let selectedAccountId = 0;
    this.allAccounts.forEach(function(item) {
      if (item.name === option) {
        selectedAccountId = item.id;
      }
    });
    this.selectedAccountId = selectedAccountId;
    this.selectedAccountName = option;
    
  }

  onDepartmentSelected(option: string,rowIndex:any): any {
    if(option == ""){
      this.allBranchDetails[rowIndex].departmentID = "";
      this.allBranchDetails[rowIndex].departmentName = "";
      return true;
    }
    let selectedDepartmentId;
    this.departmentData.forEach(function(item) {
      if (item.name === option) {
        selectedDepartmentId = item.id;
      }
    });
    this.allBranchDetails[rowIndex].departmentID = selectedDepartmentId;
    this.allBranchDetails[rowIndex].departmentName = option;
  } 

  onBranchSelected(option: string,rowIndex:any): any {
    if(option == ""){
      this.allBranchDetails[rowIndex].branchID = "";
      this.allBranchDetails[rowIndex].branchName = "";
      return true;
    }
    let selectedBranchId;
    this.branchData.forEach(function(item) {
      if (item.company === option) {
        selectedBranchId = item.id;
      }
    });
    this.allBranchDetails[rowIndex].branchID = selectedBranchId;
    this.allBranchDetails[rowIndex].branchName = option;
  } 

  onSupervisorSelected(option: string,rowIndex:any): any {
    if(option == ""){
      this.allBranchDetails[rowIndex].supervisorID = "";
      this.allBranchDetails[rowIndex].firstName = "";
      return true;
    }
    let selectedSupervisorId;
    this.supervisorData.forEach(function(item) {
      if (item.name === option) {
        selectedSupervisorId = item.id;
      }
    });
    this.allBranchDetails[rowIndex].supervisorID = selectedSupervisorId;
    this.allBranchDetails[rowIndex].firstName = option;
    this.allBranchDetails[rowIndex].employeeName = option;
  } 

  onClickUser(event:any): void {
    if (event.type === 'click') {
      this.selectedUserId = event.row.id;
      this.fetchUserById();
    }
  }

  fetchUserById(): void {
    //this.isLoading = true;
    this.usersService
    .getDetails(EndpointConstant.FILLALLUSERSBYID  +this.selectedUserId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.currentUser = response?.data.user;        
        this.imageData =  response?.data.image;
        this.usersForm.patchValue({
          firstName: this.currentUser.userDetails.firstName,
          middleName: this.currentUser.userDetails.middleName,
          lastName: this.currentUser.userDetails.lastName,
          address: this.currentUser.userDetails.address,
          emailId: this.currentUser.userDetails.emailID,
          residenceNumber: this.currentUser.userDetails.residenceNumber,
          officeNumber: this.currentUser.userDetails.officeNumber,
          mobileNumber: this.currentUser.userDetails.mobileNumber,
          designationId: this.currentUser.userDetails.designationID,
          active: this.currentUser.userDetails.active,
          employeeType: this.currentUser.userDetails.employeeType,
          username: this.currentUser.userDetails.userName,
          password: this.currentUser.userDetails.password,
          gmailId: this.currentUser.userDetails.gmailID,
          isLocationRestrictedUser: this.currentUser.userDetails.isLocationRestrictedUser,
          photoId: this.currentUser.userDetails.photoID,
          imagePath: this.currentUser.userDetails.imagePath,
          employeeId: this.currentUser.userDetails.employeeType,
          pettycash: this.currentUser.userDetails.cashAccountId,
          warehouse: this.currentUser.userDetails.warehouseId
        });
        this.selectedAccountId = this.currentUser.userDetails.accountID;
        this.selectedAccountName = this.currentUser.userDetails.accountName ? this.currentUser.userDetails.accountName : "";
        //set branch details....
        this.allBranchDetails =   this.currentUser.branchDetails;
        // check user rights and set to corresponding branch details....
        this.allBranchDetails.forEach((item:any,index:number)=>{
          let branchDetailsId = item.id;
          this.allBranchDetails[index]['mapagemenuDto'] = this.currentUser.userRights.filter(userRights => userRights.userDetailsID === branchDetailsId);
        });
        this.currentBranchTableIndex = this.allBranchDetails.length - 1;
        console.log(this.allBranchDetails);
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewUser(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.departmentValue = "";
    this.branchValue = "";
    this.usersForm.reset();
    this.selectedAccountId = 0;
    this.selectedAccountName = "";
    this.allBranchDetails = [];
    this.imageData = null;
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedUserId = this.firstUser;
      this.fetchUserById();
    } else{
      this.selectedUserId = 0;
      this.enableFormControls();
      this.usersForm.patchValue({
        active:true
      });
      this.currentBranchTableIndex = 0;
      this.addRow();
    }
    return true;
  }

  onClickEditUser(){
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
    this.fetchUserById();
    return true;
  }

  onClickDeleteUser(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.usersService.deleteDetails(EndpointConstant.DELETEUSER+this.currentUser.userDetails.id)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false; 
          this.fetchAllUsers();
          this.baseService.showCustomDialogue(response.data.msg);  
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });    
    }
    return true;
  }

  onClickSaveuser() {
    if (this.usersForm.invalid) {
      for (const field of Object.keys(this.usersForm.controls)) {
        const control: any = this.usersForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    let resbranchDetailsValid = this.checkBranchDetailsValid(this.allBranchDetails);
    if(!resbranchDetailsValid){
      return false;
    }
    this.isLoading = true;
    let branchInfo = this.processBranchInformation(this.allBranchDetails);
    let cashAccount = {};
    let warehouse = {};
    if(this.usersForm.value.pettycash){
      this.pettycashData.forEach(element => {
        if(element.accountID == this.usersForm.value.pettycash){
          cashAccount = {
            id: element.accountID,
            value: element.name
            };
        }
      });
    }

    if(this.usersForm.value.warehouse){
      this.warehouseData.forEach(element => {
        if(element.id == this.usersForm.value.warehouse){
          warehouse = element;
        }
      });
    }
    const payload:any = {     
      id: this.selectedUserId ?  this.selectedUserId : 0, 
      firstName: this.usersForm.value.firstName.trim(),
      middleName: this.usersForm.value.middleName ? this.usersForm.value.middleName.trim() : null,
      lastName: this.usersForm.value.lastName.trim(),
      address: this.usersForm.value.address,
      emailId: this.usersForm.value.emailId,
      residenceNumber: this.usersForm.value.residenceNumber,
      officeNumber: this.usersForm.value.officeNumber,
      mobileNumber: this.usersForm.value.mobileNumber,
      designation: {
        id:this.usersForm.value.designationId ? this.usersForm.value.designationId : 0,
        value:""
      },
      active: this.usersForm.value.active,
      employeeType: {
        id:this.usersForm.value.employeeType,
        value: "string"
      },
      username: this.usersForm.value.username,
      password: this.usersForm.value.password,
      gmailId: this.usersForm.value.gmailId,
      isLocationRestrictedUser: this.isLocationRestrictedUser,
      photoId: this.usersForm.value.photoId,
      account: {
        id: this.selectedAccountId,
        value: this.selectedAccountName
      },
      imagePath: this.imageData,
      cashAccountId: cashAccount,
      warehouseId: warehouse,
      userBranchDetails:branchInfo
    };
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
    return true;
  }

  checkBranchDetailsValid(branchDetails: any): boolean {
    let isMainBranchFlag = false;
  console.log(branchDetails);
    for (const item of branchDetails) {
      if (item.branchID === "" || item.departmentID === "" || item.supervisorID === "" || item.mapagemenuDto.length === 0) {
        this.baseService.showCustomDialogue('Branch details cannot be empty');
        return false;
      }
      if (item.isMainBranch === true) {
        isMainBranchFlag = true;
      }
    }
  
    if (isMainBranchFlag === false) {
      this.baseService.showCustomDialogue('Please select isMainBranch');
      return false;
    }
  
    return true;
  }
  

  processBranchInformation(branchDetails:any){
    let branchDetailsArray:any = [];
    branchDetails.forEach((item:any) => {
      let pageMenuArray:any = [];
      item.mapagemenuDto.forEach((pagemenu:any)=>{
        if(pagemenu.isApprove == true || pagemenu.isView == true || pagemenu.isCreate == true || pagemenu.isEdit == true || pagemenu.isCancel == true || pagemenu.isDelete == true || pagemenu.isEditApproved == true || pagemenu.isHigherApprove == true || pagemenu.isPrint == true || pagemenu.isEmail == true || pagemenu.frequentlyUsed == true){
          let userRightsStruct = {
            userDetailsId : item.id,
            pageMenuId:pagemenu.pageMenuID,
            isView: pagemenu.isView,
            isCreate: pagemenu.isCreate,
            isEdit: pagemenu.isEdit,
            isCancel: pagemenu.isCancel,
            isDelete: pagemenu.isDelete,
            isApprove: pagemenu.isApprove,
            isEditApproved: pagemenu.isEditApproved,
            isHigherApprove:pagemenu.isHigherApprove,
            isPrint: pagemenu.isPrint,
            isEmail: pagemenu.isEmail,
            frequentlyUsed: pagemenu.frequentlyUsed
          };     
          pageMenuArray.push(userRightsStruct);
        }
      });

      let branchDetailsStruct = {
        employeeId:item.employeeID,
        branchName: {
          id: item.branchID,
          value: item.branchName
        },
        departmentName: {
          id: item.departmentID,
          value: item.departmentName
        },
        activeFlag: item.activeFlag ? 1 : 0,
        isMainBranch: item.isMainBranch,
        supervisor: {
          id: item.supervisorID,
          value:item.firstName
        },
        maRoleId: item.maRoleID,
        mapagemenuDto: pageMenuArray
      };      
      branchDetailsArray.push(branchDetailsStruct);
    });
    return branchDetailsArray;
  }

  updateCallback(payload:any){
    this.usersService.updateDetails(EndpointConstant.UPDATEUSER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 201){
            this.baseService.showCustomDialogue(response.data.msg);          
            this.selectedUserId = this.firstUser;
            this.fetchUserById();
            this.fetchAllUsers();
            this.setInitialState();
          } else{
            this.baseService.showCustomDialogue('Some error occured');
          }         
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.usersService.saveDetails(EndpointConstant.SAVEUSER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 201){
            this.baseService.showCustomDialogue(response.data.msg);          
            this.selectedUserId = this.firstUser;
            this.fetchUserById();
            this.fetchAllUsers();
            this.setInitialState();
          } else{
            this.baseService.showCustomDialogue('Some error occured');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Designation', error);
        },
      });
  }

  enableFormControls(){
    this.usersForm.get('firstName')?.enable();
    this.usersForm.get('middleName')?.enable();
    this.usersForm.get('lastName')?.enable();
    this.usersForm.get('address')?.enable();
    this.usersForm.get('emailId')?.enable();
    this.usersForm.get('residenceNumber')?.enable();
    this.usersForm.get('officeNumber')?.enable();
    this.usersForm.get('mobileNumber')?.enable();
    this.usersForm.get('designationId')?.enable();
    this.usersForm.get('active')?.enable();
    this.usersForm.get('employeeType')?.enable();
    this.usersForm.get('username')?.enable();
    this.usersForm.get('password')?.enable();
    this.usersForm.get('pettycash')?.enable();
    this.usersForm.get('warehouse')?.enable();
    this.usersForm.get('gmailId')?.enable();
    this.usersForm.get('isLocationRestrictedUser')?.enable();
    this.usersForm.get('photoId')?.enable();
    this.usersForm.get('imagePath')?.enable();
    this.usersForm.get('employeeId')?.enable();
    this.usersForm.get('departmentId')?.enable();
    this.usersForm.get('createdOn')?.enable();     
  }

  disbaleFormControls(){
    this.usersForm.get('firstName')?.disable();
    this.usersForm.get('middleName')?.disable();
    this.usersForm.get('lastName')?.disable();
    this.usersForm.get('address')?.disable();
    this.usersForm.get('emailId')?.disable();
    this.usersForm.get('residenceNumber')?.disable();
    this.usersForm.get('officeNumber')?.disable();
    this.usersForm.get('mobileNumber')?.disable();
    this.usersForm.get('designationId')?.disable();
    this.usersForm.get('active')?.disable();
    this.usersForm.get('employeeType')?.disable();
    this.usersForm.get('username')?.disable();
    this.usersForm.get('password')?.disable();    
    this.usersForm.get('pettycash')?.disable();
    this.usersForm.get('warehouse')?.disable();
    this.usersForm.get('gmailId')?.disable();
    this.usersForm.get('isLocationRestrictedUser')?.disable();
    this.usersForm.get('photoId')?.disable();    
    this.usersForm.get('imagePath')?.disable();
    this.usersForm.get('employeeId')?.disable();
    this.usersForm.get('departmentId')?.disable();
    this.usersForm.get('createdOn')?.disable();
  }

  onLocationRestrictedUserChange(event: any) {
    this.isLocationRestrictedUser = event.target.checked ? true : false;
  }

  openUserRolePopup(index:any){
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.currentMaRoleID = this.allBranchDetails[index] ?.maRoleID;
    this.currentBranchDetailsIndex = index;
    this.allUserRights = this.allBranchDetails[index]['mapagemenuDto'];
    this.showUserRolePopup = true;
  }

  onUserRoleSelected(data: any): any {
    if (data) {
      this.allBranchDetails[this.currentBranchDetailsIndex]['mapagemenuDto'] = data.pageMenus;
      this.allBranchDetails[this.currentBranchDetailsIndex]['maRoleID'] = data.maRoleId;
      this.currentMaRoleID = data.maRoleId;
    }
    this.showUserRolePopup = false;
  } 
  // Custom validator function to check for special characters
  noSpecialCharactersValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value: string = control.value;
      const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]+/;

      if (specialCharacters.test(value)) {
        return { 'specialCharacters': true };
      }

      return null;
    };
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
  
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.error('Only image files are allowed.');
      return;
    }
  
    // Check file size (e.g., 5 MB maximum)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      console.error('File size exceeds the maximum allowed size.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imageData = reader.result; 
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageData = null;
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
