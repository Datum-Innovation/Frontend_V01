import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BranchService } from '../../services/branch.service';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService, minLengthValidator, selectToken } from '@dfinance-frontend/shared';
import { Subject, empty, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { Branch, BranchType, Branches, ContactPerson, Country, Department, Departments } from '../model/branch.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from '../../services/departments.service';

declare var $: any;
@Component({
  selector: 'dfinance-frontend-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css'],
})
export class DepartmentsComponent implements OnInit,OnDestroy{
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('scrollableDivLeft') scrollableDivLeft!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  departmentForm!: FormGroup;    
  selectedContactPerson = {} as ContactPerson;
  selectedBranchType = {} as BranchType;
  selectedCountry = {} as Country;
  contactPerson = [] as Array<ContactPerson>;
  allBranches = [] as Array<Branches>;
  allDepartments = [] as Array<Departments>;
  branchType:BranchType[] = [
    {
    "value":"HO",
    "name":"Head Office"
    },
    {
    "value":"BO",
    "name":"Branch Office"
    }];
  countries = [] as Array<Country>;  
  selectedContactPersonId!: number;
  selectedBranchTypeId!: string;
  selectedCountryId!: string;
  selectedDepartmentId: number = 0;
  selectedCompanyId:number = 0;
  selectedId:number = 0;
  firstDepartment!:number;
  isActive: number = 0;
  currentDepartment = {} as Department;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  companyControls: FormGroup[] = [];
  isLoading = false;
  showBranchSelectionPopup = false;
  selectedBranches: Branches[] = [];
  savedBranches:any[] = [];
  get companyFormArray() {
    return this.departmentForm.controls['companies'] as FormArray;
  }
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
    private branchService: BranchService,
    private departmentService:DepartmentService,
    private store: Store,
    private router:Router,
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
    this.departmentForm = this.formBuilder.group({      
      department:[{value:'',disabled:this.isInputDisabled}, Validators.required]
    });

    this.fetchAllDepartments();
    this.fetchAllBranches();
  }
  get companies() {
    return this.departmentForm.controls['companies'] as FormArray
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

  onActiveChange(event: any) {
    this.isActive = event.target.checked ? 1 : 0;
  }

  fetchAllBranches(): void {
    this.branchService
    .getDetails(EndpointConstant.FILLALLBRANCH)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allBranches = response?.data; 
        this.fetchDepartmentById();
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchAllDepartments(): void {
    //this.isLoading = true;
    this.departmentService
    .getDetails(EndpointConstant.FILLALLDEPARTMENTS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.allDepartments = response?.data;
        //this.setBranches();
        this.selectedId = this.allDepartments[0].id;
        this.firstDepartment = this.allDepartments[0].id;
        this.fetchDepartmentById();
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  setBranches():void{
     // Create the table
     $(this.table.nativeElement).DataTable({
      data: this.allDepartments,
      columns: [
        { title: 'Department', data: 'department' }
      ]
    });
  }

  onClickDepartments(event:any): void {
    if (event.type === 'click') {
      this.selectedBranches = [];
      this.savedBranches = [];
      this.selectedId = event.row.id;
      this.fetchDepartmentById();
    }
  }

  fetchDepartmentById(): void {
    //this.isLoading = true;
    this.selectedBranches = [];
    this.departmentService
    .getDetails(EndpointConstant.FILLALLDEPARTMENTBYID  +this.selectedId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        if(response.data.length > 0){
          this.currentDepartment = response?.data[0];
          this.selectedDepartmentId = this.currentDepartment?.departmentTypeID;
          this.selectedCompanyId = this.currentDepartment?.companyID;
          this.departmentForm.patchValue({
            department: this.currentDepartment.departmentType,
          });
          response.data.forEach((branches:any) => {
            this.savedBranches.push(branches.companyID);
            const branchIndex = this.allBranches.findIndex(branch => branch.id === branches.companyID);
            if (branchIndex !== -1) {
              this.selectedBranches.push(this.allBranches[branchIndex]);
            }  
          });
                    
        }        
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewDepartment(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.departmentForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedId = this.firstDepartment;
      this.fetchDepartmentById();
    } else{
      this.selectedBranches = [];
      this.savedBranches = [];
      this.selectedId = 0;
      this.selectedDepartmentId = 0;
      this.enableFormControls();
    }
    return true;
  }

  onClickEditDepartment(){
    if(!this.isEdit){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    this.selectedBranches = [];
      this.savedBranches = [];
    if(this.isInputDisabled == false){
      this.enableFormControls();
    } else{
      this.disbaleFormControls();
    }
    this.fetchDepartmentById();
    return true;
  }

  onClickDeleteDepartment(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.departmentService.deleteDetails(EndpointConstant.DELETEDEPARTMENT+this.selectedId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data);          
          this.selectedId = this.firstDepartment;
          this.setInitialState();
          this.fetchAllDepartments();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
    }
    return true;
  }

  onClickSaveDepartment() {
    if (this.departmentForm.invalid) {
      for (const field of Object.keys(this.departmentForm.controls)) {
        const control: any = this.departmentForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    const matchedBranches: any[] = [];

    const filteredBranches = this.allBranches.filter(branch => {
      const isMatching = this.selectedBranches.some(selectedBranch => selectedBranch.id === branch.id);
      if (isMatching) {
        matchedBranches.push({"id":branch.id, "branchName":branch.company,"activeFlag":1 });
      }
      return isMatching;
    });
    if(matchedBranches.length == 0){
      this.baseService.showCustomDialogue('Please select atleast one company');
      return false;
    }
      
    this.isLoading = true;
    const payload = {     
      depId : this.selectedId,
      department: this.departmentForm.value.department,    
      branch:  matchedBranches
    };
    if(this.isUpdate){
      //call update departments ...
      this.saveCallback(payload); 
    } else{
      this.saveCallback(payload); 
    }
    return true;
  }


  saveCallback(payload:any){
    this.departmentService.saveDetails(EndpointConstant.SAVEDEPARTMENT,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          let message = response.data?.msg;
          this.baseService.showCustomDialogue(message);          
          this.selectedId = this.firstDepartment;
          this.setInitialState();
          this.fetchAllDepartments();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  enableFormControls(){
    this.departmentForm.get('department')?.enable();
    this.departmentForm.get('companies')?.enable();
  }

  disbaleFormControls(){
    this.departmentForm.get('department')?.disable();
    this.departmentForm.get('companies')?.disable();
  }

  selectUnselectAll(event: any) {
    const isChecked = event.target.checked;
  }

  openBranchSelectionPopup() {
    this.showBranchSelectionPopup = true;
  }

  onBranchSelectionConfirmed(selectedBranches: any[]) {
    this.selectedBranches = selectedBranches;console.log(this.selectedBranches);
    this.showBranchSelectionPopup = false;
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
