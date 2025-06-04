import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService, minLengthValidator, selectToken } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import {  DatePipe, formatDate } from '@angular/common';
import { CostCenterService } from '../../services/costcenter.service';
import { ClientDropdown, ConsultancyDropdown, CostCategories, CostCategory, CostCenter, CostCenters, CostCentreStatus, CreateUnder, Nature, StaffDropdown } from '../model/costcenter.interface';
import { NgbAlertModule, NgbDateStruct, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NativeDateAdapter, DateAdapter,
  MAT_DATE_FORMATS } from '@angular/material/core';
declare var $: any;
export const PICK_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

class PickDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd/MM/yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}
@Component({
  selector: 'dfinance-frontend-costcenter',
  templateUrl: './costcenter.component.html',
  styleUrls: ['./costcenter.component.css'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
  ]
})
export class CostcenterComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  sDate: NgbDateStruct | null = null;
  eDate: NgbDateStruct | null = null;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  costCenterForm!: FormGroup;    
  allCostCenters = [] as Array<CostCenters>; 
  allStatus = [] as Array<CostCentreStatus>; 
  selectedCostCenterId!: number;
  firstCostCenter!:number;
  active: boolean = false;
  isGroup: boolean = false;
  currentCostCenter = {} as CostCenter;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;  
  selectedCategoryId!: string;  
  selectedCategory = {} as CostCategory;
  selectedCreateUnderId!: string;  
  selectedCreateUnder = {} as CreateUnder;
  costCategories = [] as Array <CostCategories>;
  createUnderData = [] as Array <CreateUnder>;
  natureList:Nature[] = [
    {
    "value":1,
    "name":"Real"
    },
    {
    "value":2,
    "name":"UnReal"
    }];
    selectedNature = {} as Nature;
    selectedNatureId!:string;
    selectedStatus = {} as CostCentreStatus;
    selectedStatusId!:String;
    consultancyOptions:any = [];
    consultancyData = [] as Array<ConsultancyDropdown>;
    clientOptions:any = [];
    clientData = [] as Array<ClientDropdown>;
    engineerOptions:any = [];
    engineerData = [] as Array<StaffDropdown>;
    foremanOptions:any = [];
    foremanData = [] as Array<StaffDropdown>;
    clientValue = "";
    consultancyValue = "";
    engineerValue = "";
    foremanValue = "";
    isLoading = false;
    clientreturnField:string = 'name';
    clientKeys = ['ID','Name','Code'];
    engineerreturnField:string = 'name';
    engineerKeys = ['ID','Name','Code'];
    foremanreturnField:string = 'name';
    foremanKeys = ['ID','Name','Code'];
    consultancyreturnField:string = 'name';
    consultancyKeys = ['ID','Name','Code'];
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
    private costCenterService: CostCenterService,
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
    this.costCenterForm = this.formBuilder.group({      
      code:[{value:'',disabled:this.isInputDisabled}, Validators.required],
      name:[{value:'',disabled:this.isInputDisabled}, Validators.required],
      category:[{value:'',disabled:this.isInputDisabled}],
      isgroup:[{value:'',disabled:this.isInputDisabled}],      
      createunder:[{value:'',disabled:this.isInputDisabled}],      
      active:[{value:true,disabled:this.isInputDisabled}],
      remarks:[{value:'',disabled:this.isInputDisabled}],
      nature:[{value:'',disabled:this.isInputDisabled}, Validators.required],
      status:[{value:'',disabled:this.isInputDisabled}],
      regno:[{value:'',disabled:this.isInputDisabled}],
      serialno:[{value:'',disabled:this.isInputDisabled}],
      client:[{value:'',disabled:this.isInputDisabled}],
      consultancy:[{value:'',disabled:this.isInputDisabled}],
      engineer:[{value:'',disabled:this.isInputDisabled}],
      foreman:[{value:'',disabled:this.isInputDisabled}],
      startdate:[{value:'',disabled:this.isInputDisabled}],      
      enddate:[{value:'',disabled:this.isInputDisabled}],      
      contractvalue:[{value:'',disabled:this.isInputDisabled}],
      invoicevalue:[{value:'',disabled:this.isInputDisabled}],
      make:[{value:'',disabled:this.isInputDisabled}],      
      makeyear:[{value:'',disabled:this.isInputDisabled}],      
      site:[{value:'',disabled:this.isInputDisabled}],
      rate:[{value:'',disabled:this.isInputDisabled}]
    });
    this.fetchAllCostCenters();
    this.fetchCostCategories();
    this.fetchCreateUnderData();
    this.fetchCostCenterStatus();
    this.fetchconsultancyDropdown();
    this.fetchClientDropdown();
    this.fetchEngineerDropdown();
    this.fetchForemanDropdown();
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

  onConsultancySelected(option: string): void {
    let selectedConsultancyId;
    this.consultancyData.forEach(function(item) {
      if (item.name === option) {
        selectedConsultancyId = item.id;
      }
    });
    this.consultancyValue = option;
    this.costCenterForm.patchValue({
      consultancy: selectedConsultancyId
    });
  }

  onClientSelected(option: string): void {
    let selectedClientId;
    this.clientData.forEach(function(item) {
      if (item.name === option) {
        selectedClientId = item.id;
      }
    });
    this.clientValue = option;
    this.costCenterForm.patchValue({
      client: selectedClientId
    });
  }

  onEngineerSelected(option: string): void {
    let selectedEngineerId;
    this.engineerData.forEach(function(item) {
      if (item.name === option) {
        selectedEngineerId = item.id;
      }
    });
    this.engineerValue = option;
    this.costCenterForm.patchValue({
      engineer: selectedEngineerId
    });
  }

  onForemanSelected(option: string): void {
    let selectedForemanId;
    this.foremanData.forEach(function(item) {
      if (item.name === option) {
        selectedForemanId = item.id;
      }
    });
    this.foremanValue = option;
    this.costCenterForm.patchValue({
      foreman: selectedForemanId
    });
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

  fetchAllCostCenters(): void {
    //this.isLoading = true;
    this.costCenterService
    .getDetails(EndpointConstant.FILLALLCOSTCENTERS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.allCostCenters = response?.data;
        //this.setBranches();
        this.selectedCostCenterId = this.allCostCenters[0].id;
        this.firstCostCenter = this.allCostCenters[0].id;
        this.fetchCostCenterById();
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchCostCategories(): void {
    this.costCenterService
    .getDetails(EndpointConstant.FILLCOSTCATEGORY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.costCategories = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchCreateUnderData(): void {
    this.costCenterService
    .getDetails(EndpointConstant.COSTCENTERDROPDOWN)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.createUnderData = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchCostCenterStatus(): void {
    this.costCenterService
    .getDetails(EndpointConstant.FILLCOSTCENTERSTATUS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allStatus = response?.data[0];
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchconsultancyDropdown(): void {
    this.costCenterService
    .getDetails(EndpointConstant.FILLCONSULTANCYPOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.consultancyData = response?.data;
        this.consultancyOptions = this.consultancyData.map((item: any) => ({
          id:item.id,
          name: item.name,
          code: item.code
        }));
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchClientDropdown(): void {
    this.costCenterService
    .getDetails(EndpointConstant.FILLCLIENTPOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.clientData = response?.data;
        this.clientOptions = this.clientData.map((item: any) => ({
          id:item.id,
          code: item.code,
          name: item.name
        }));

      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchEngineerDropdown(): void {
    this.costCenterService
    .getDetails(EndpointConstant.FILLSTAFFOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.engineerData = response?.data;
        this.engineerOptions = this.engineerData.map((item: any) => ({
          id:item.id,
          code: item.code,
          name: item.name
        }));

      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchForemanDropdown(): void {
    this.costCenterService
    .getDetails(EndpointConstant.FILLSTAFFOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.foremanData = response?.data;
        this.foremanOptions = this.foremanData.map((item: any) => ({
          id:item.id,
          code: item.code,
          name: item.name
        }));

      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  onCostCategorySelect(): void {
    this.selectedCategoryId = this.costCenterForm?.get('category')?.value;
    this.selectedCategory = this.costCategories?.find(obj => obj?.name == this.selectedCategoryId) as CostCategory;
  }

  onCreateUnderSelect(): void {
    this.selectedCreateUnderId = this.costCenterForm?.get('createunder')?.value;
    this.selectedCreateUnder = this.createUnderData?.find(obj => obj?.name == this.selectedCreateUnderId) as CreateUnder;
  }

  onActiveChange(event: any) {
    this.active = event.target.checked ? true : false;
  }

  onGroupChange(event: any) {
    this.isGroup = event.target.checked ? true : false;
  }

  onNatureSelect(): void {
    this.selectedNatureId = this.costCenterForm?.get('nature')?.value;
    this.selectedNature = this.natureList?.find(obj => obj?.name == this.selectedNatureId) as Nature;

  }

  onCostCategoryStatusSelect():void{
    this.selectedStatusId = this.costCenterForm?.get('status')?.value;
    this.selectedStatus = this.allStatus?.find(obj => obj?.value == this.selectedStatusId) as CostCentreStatus;
  }
  // setBranches():void{
  //    // Create the table
  //    $(this.table.nativeElement).DataTable({
  //     data: this.allCostCenters,
  //     columns: [
  //       { title: 'Nature', data: 'nature' },
  //       { title: 'Company', data: 'company' }
  //     ]
  //   });
  // }

  onClickCostCenter(event:any): void {
    if (event.type === 'click') {
      this.selectedCostCenterId = event.row.id;
      this.fetchCostCenterById();
    }
  }

  fetchCostCenterById(): void {
    //this.isLoading = true;
    this.costCenterService
    .getDetails(EndpointConstant.FILLALLCOSTCENTERBYID  +this.selectedCostCenterId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.currentCostCenter = response?.data[0];
        let formsDate = null;
        let formeDate = null;
        if(this.currentCostCenter.sDate != null){
          formsDate = this.datePipe.transform(new Date(this.currentCostCenter.sDate), 'yyyy-MM-dd');
        }
        if(this.currentCostCenter.eDate != null){
          formeDate = this.datePipe.transform(new Date(this.currentCostCenter.eDate), 'yyyy-MM-dd');
        }
        this.costCenterForm.patchValue({
          code: this.currentCostCenter.code,
          name: this.currentCostCenter.description,          
          category: this.currentCostCenter.categoryName,
          isgroup: this.currentCostCenter.isGroup,          
          createunder: this.currentCostCenter.parentName,
          active: this.currentCostCenter.active,
          remarks: this.currentCostCenter.remarks,
          nature: this.currentCostCenter.pType,
          status: this.currentCostCenter.status,
          regno: this.currentCostCenter.regNo,
          serialno: this.currentCostCenter.serialNo,
          client: this.currentCostCenter.clientID,
          consultancy: this.currentCostCenter.supplierID,
          engineer: this.currentCostCenter.staffID,
          foreman: this.currentCostCenter.staffID1,
          startdate : formsDate,
          enddate : formeDate,
          contractvalue: this.currentCostCenter.contractValue,
          invoicevalue: this.currentCostCenter.invoicedAmt,
          make: this.currentCostCenter.make,
          makeyear: this.currentCostCenter.mYear,
          site: this.currentCostCenter.site,
          rate: this.currentCostCenter.rate 
        });
        
        this.onCostCategorySelect();
        this.onCreateUnderSelect();
        this.onNatureSelect();
        this.onCostCategoryStatusSelect();  
        // changing searcbable dropdown values...
        this.clientValue =   this.currentCostCenter.clientName;
        this.consultancyValue =   this.currentCostCenter.supplierName;
        this.engineerValue =   this.currentCostCenter.staffIDName;
        this.foremanValue =   this.currentCostCenter.staffIDName;

      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }


  convertToLocalDateString(selectedDate: Date | null): string | null {
    if (!selectedDate) {
      return null;
    }
  
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const seconds = selectedDate.getSeconds().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
  }

  onClickNewCostCenter(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.costCenterForm.reset();
    this.clientValue = "";
    this.consultancyValue = "";
    this.engineerValue = "";
    this.foremanValue = "";
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCostCenterId = this.firstCostCenter;
      this.fetchCostCenterById();
    } else{
      this.selectedCostCenterId = 0;
      this.enableFormControls();
      this.costCenterForm.patchValue({
        active:true
      }); 
    }
    return true;
  }

  onClickEditCostCenter(){
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
    this.fetchCostCenterById();
    return true;
  }

  onClickDeleteCostCenter(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.costCenterService.deleteDetails(EndpointConstant.DELETECOSTCENTER+this.selectedCostCenterId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedCostCenterId = this.firstCostCenter;
          this.fetchAllCostCenters();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
    }
    return true;
  }

  onClickSaveCostCenter() {
    if (this.costCenterForm.invalid) {
      for (const field of Object.keys(this.costCenterForm.controls)) {
        const control: any = this.costCenterForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    this.isLoading = true;
    const selectedsDate = this.costCenterForm.value.startdate;
    // Create a JavaScript Date object from the provided date components
    const jssDate = selectedsDate ? (this.convertToLocalDateString(new Date(selectedsDate))) : null;
    // Convert the JavaScript Date object to an ISO string
    const sDateisoString = jssDate;

    const selectedeDate = this.costCenterForm.value.enddate;
    // Create a JavaScript Date object from the provided date components
    const jseDate = selectedeDate ? (this.convertToLocalDateString(new Date(selectedeDate))) : null;
    // Convert the JavaScript Date object to an ISO string
    const eDateisoString = jseDate;
    console.log(this.costCenterForm.value.consultancy);
    const payload = 
    {
      "code": this.costCenterForm.value.code,
      "name": this.costCenterForm.value.name, 
      "nature": {
        "key": this.selectedNature?.name,
        "value": this.selectedNature?.name
      },
      "active": this.active,
      "serialNo": this.costCenterForm.value.serialno,
      "regNo": this.costCenterForm.value.regno,
      "consultancy": this.costCenterForm.value.consultancy ? this.costCenterForm.value.consultancy : 1,
      "status": {
        "id": this.selectedStatus?.id,
        "value": this.selectedStatus?.value
      },
      "remarks": this.costCenterForm.value.remarks,
      "rate": this.costCenterForm.value.rate,
      "startDate":sDateisoString ,//"2023-11-28T05:10:25.004Z",
      "make": this.costCenterForm.value.make,
      "makeYear": this.costCenterForm.value.makeyear,
      "endDate": eDateisoString,
      "contractValue": this.costCenterForm.value.contractvalue ? this.costCenterForm.value.contractvalue : 0,
      "invoiceValue": this.costCenterForm.value.invoicevalue ? this.costCenterForm.value.invoicevalue : 0,
      "client": this.costCenterForm.value.client ? this.costCenterForm.value.client : 1,
      "engineer": this.costCenterForm.value.engineer ? this.costCenterForm.value.engineer : 0,
      "foreman": this.costCenterForm.value.foreman ? this.costCenterForm.value.foreman : 0,
      "site": this.costCenterForm.value.site,
      "isGroup": this.isGroup,
      "category": {
        "id": this.selectedCategory?.id,
        "name": this.selectedCategory?.name
      },
      "createUnder": {
        "id": this.selectedCreateUnder?.id,
        "name": this.selectedCreateUnder?.name
      }
    }
    if(this.isUpdate){
      this.updateCallback(payload,this.selectedCostCenterId);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any,costcenterId:any){
    this.costCenterService.updateDetails(EndpointConstant.UPDATECOSTCENTER + costcenterId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 200){ 
            this.baseService.showCustomDialogue(response.data.msg);          
            this.selectedCostCenterId = this.firstCostCenter;
            this.fetchCostCenterById();
            this.fetchAllCostCenters();
            this.setInitialState();
          } else{
            this.baseService.showCustomDialogue(response.data);           
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.costCenterService.saveDetails(EndpointConstant.SAVECOSTCENTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 201){
            this.baseService.showCustomDialogue(response.data.msg);          
            this.selectedCostCenterId = this.firstCostCenter;
            this.fetchCostCenterById();
            this.fetchAllCostCenters();
            this.setInitialState();
          } else{
            this.baseService.showCustomDialogue(response.data);            
          }
          
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Cost center', error);
        },
      });
  }

  enableFormControls(){
    this.costCenterForm.get('code')?.enable();
    this.costCenterForm.get('name')?.enable();
    this.costCenterForm.get('category')?.enable();
    this.costCenterForm.get('isgroup')?.enable();
    this.costCenterForm.get('createunder')?.enable();
    this.costCenterForm.get('active')?.enable();
    this.costCenterForm.get('remarks')?.enable();
    this.costCenterForm.get('nature')?.enable();
    this.costCenterForm.get('status')?.enable();
    this.costCenterForm.get('regno')?.enable();
    this.costCenterForm.get('serialno')?.enable();
    this.costCenterForm.get('client')?.enable();
    this.costCenterForm.get('consultancy')?.enable();
    this.costCenterForm.get('engineer')?.enable();
    this.costCenterForm.get('foreman')?.enable();
    this.costCenterForm.get('startdate')?.enable();
    this.costCenterForm.get('enddate')?.enable();
    this.costCenterForm.get('contractvalue')?.enable();
    this.costCenterForm.get('invoicevalue')?.enable();
    this.costCenterForm.get('make')?.enable();
    this.costCenterForm.get('makeyear')?.enable();
    this.costCenterForm.get('site')?.enable();
    this.costCenterForm.get('rate')?.enable();

  }

  disbaleFormControls(){
    this.costCenterForm.get('code')?.disable();
    this.costCenterForm.get('name')?.disable();
    this.costCenterForm.get('category')?.disable();
    this.costCenterForm.get('isgroup')?.disable();
    this.costCenterForm.get('createunder')?.disable();
    this.costCenterForm.get('active')?.disable();
    this.costCenterForm.get('remarks')?.disable();
    this.costCenterForm.get('nature')?.disable();
    this.costCenterForm.get('status')?.disable();
    this.costCenterForm.get('regno')?.disable();
    this.costCenterForm.get('serialno')?.disable();
    this.costCenterForm.get('client')?.disable();
    this.costCenterForm.get('consultancy')?.disable();
    this.costCenterForm.get('engineer')?.disable();
    this.costCenterForm.get('foreman')?.disable();
    this.costCenterForm.get('startdate')?.disable();
    this.costCenterForm.get('enddate')?.disable();
    this.costCenterForm.get('contractvalue')?.disable();
    this.costCenterForm.get('invoicevalue')?.disable();
    this.costCenterForm.get('make')?.disable();
    this.costCenterForm.get('makeyear')?.disable();
    this.costCenterForm.get('site')?.disable();
    this.costCenterForm.get('rate')?.disable();
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
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight -40;
    
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

