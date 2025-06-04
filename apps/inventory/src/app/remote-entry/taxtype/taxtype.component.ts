import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { TaxTypeService } from '../../services/TaxTypeService';
import { TaxTypeAcDrpDwn, TaxTypeDrpDwn, TaxTypeFillMaster, TaxTypeMaster } from '../model/taxType.interface';
declare var $: any;
@Component({
  selector: 'dfinance-frontend-taxtype',
  templateUrl: './taxtype.component.html',
  styleUrls: ['./taxtype.component.css'],
})
export class TaxtypeComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  taxTypeForm!: FormGroup;    
  allTaxTypeMaster = [] as Array<TaxTypeFillMaster>;   
  selectedTaxTypeMasterId = 0;
  firstTaxTypeMaster = 0;
  //isActive: number = 0;
  currentTaxType = {} as TaxTypeMaster;   
  isInputDisabled = true;
  isNewBtnDisabled = false;
  isEditBtnDisabled = false;
  isDeleteBtnDisabled = false; 
  isSaveBtnDisabled = true; 
  isUpdate = false;

  
  isLoading = false;

  commonFillData:any = [];

  allType :any=[
  {
    "Id":"Item",
    "Value":"Item"
  },{
    "Id":"Total",
    "Value":"Total"
  },];
  typeOptions: any = [];
  selectedTypeId = "";
  selectedTypeName = "";

  allsalePurMode = [] as Array<TaxTypeDrpDwn>;
  salePurModeOptions: any = [];
  selectedsalePurModeId = 0;
  selectedsalePurModeName = "";

  allTaxType = [] as Array<TaxTypeDrpDwn>;
  saleTaxTypeOptions: any = [];
  selectedTaxTypeId = 0;
  selectedTaxTypeName = "";

allreceivableAccount = [] as Array<TaxTypeAcDrpDwn>;
receivableAccountOptions: any = [];
  selectedreceivableAccountId = 0;
  selectedreceivableAccountName = "";

  allpayableAccount = [] as Array<TaxTypeAcDrpDwn>;
  payableAccountOptions: any = [];
  selectedpayableAccountId = 0;
  selectedpayableAccountName = "";

  allcgstPayable = [] as Array<TaxTypeAcDrpDwn>;
  cgstPayableOptions: any = [];
  selectedcgstPayableId =0;
  selectedcgstPayableName = "";

  allsgstPayable = [] as Array<TaxTypeAcDrpDwn>;
  sgstPayableOptions: any = [];
  selectedsgstPayableId = 0;
  selectedsgstPayableName = "";

  allcgstReceivable = [] as Array<TaxTypeAcDrpDwn>;
  cgstReceivableOptions: any = [];
  selectedcgstReceivableId = 0;
  selectedcgstReceivableName = "";

  allsgstReceivable = [] as Array<TaxTypeAcDrpDwn>;
  sgstReceivableOptions: any = [];
  selectedsgstReceivableId = 0;
  selectedsgstReceivableName = "";

  allcessPayables = [] as Array<TaxTypeAcDrpDwn>;
  cessPayablesOptions: any = [];
  selectedcessPayablesId  = 0;
  selectedcessPayablesName = "";

  allcessReceivable = [] as Array<TaxTypeAcDrpDwn>;
  cessReceivableOptions: any = [];
  selectedcessReceivableId= 0;
  selectedcessReceivableName = "";

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
    private taxTypeService: TaxTypeService,
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
    this.taxTypeForm = this.formBuilder.group({      
      type: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      name: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      description: [{value: '', disabled: this.isInputDisabled}],
      purchasePerc: [{value: '', disabled: this.isInputDisabled}],
      salesPerc: [{value: '', disabled: this.isInputDisabled}],
      cess: [{value: '', disabled: this.isInputDisabled}],
      default: [{value: false, disabled: this.isInputDisabled}], 
      active: [{value: true, disabled: this.isInputDisabled}],
      receivableAccount: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      payableAccount: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      salePurcMode: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      taxType: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      cgstReceivable: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      cgstPayable: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      sgstPayable: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      sgstReceivable: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      cessPayables: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      cessReceivable: [{value: '', disabled: this.isInputDisabled}, Validators.required],
    });
    this.fetchallTaxTypeMaster();
    this.fetchLoadData();

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

fetchLoadData(): void {
  this.taxTypeService
  .getDetails(EndpointConstant.TAXTYPELOADDATA)
  .pipe(takeUntil(this.destroySubscription))
  .subscribe({
    next: (response) => {          
      this.commonFillData = response?.data;
      //set salePurchaseMode data..
      this.allsalePurMode = this.commonFillData?.salePurchaseMode;
          if (this.allsalePurMode?.length > 0) {
            this.taxTypeForm.patchValue({
              salePurcMode: this.allsalePurMode[0].ID
            });
          }
      //set taxTypes data..
      this.allTaxType = this.commonFillData?.taxTypes;
          if (this.allTaxType?.length > 0) {
            this.taxTypeForm.patchValue({
              taxType: this.allTaxType[0].ID
            });
          }
          //set receivableAccount data..
      this.allreceivableAccount = this.commonFillData?.receivableAccount;
      if (this.allreceivableAccount?.length > 0) {
        this.taxTypeForm.patchValue({
          receivableAccount: this.allreceivableAccount[0].ID
        });
      } 
       //set payableAccount data..
      this.allpayableAccount = this.commonFillData?.payableAccount;
      if (this.allpayableAccount?.length > 0) {
        this.taxTypeForm.patchValue({
          payableAccount: this.allpayableAccount[0].ID
        });
      }
       //set cgstPayable data..
      this.allcgstPayable = this.commonFillData?.cgstPayable;
      if (this.allcgstPayable?.length > 0) {
        this.taxTypeForm.patchValue({
          cgstPayable: this.allcgstPayable[0].ID
        });
      }
       //set sgstPayable data..
      this.allsgstPayable = this.commonFillData?.sgstPayable;
      if (this.allsgstPayable?.length > 0) {
        this.taxTypeForm.patchValue({
          sgstPayable: this.allsgstPayable[0].ID
        });
      }
       //set cgstReceivable data..
      this.allcgstReceivable = this.commonFillData?.cgstReceivable;
      if (this.allcgstReceivable?.length > 0) {
        this.taxTypeForm.patchValue({
          cgstReceivable: this.allcgstReceivable[0].ID
        });
      }
       //set sgstReceivable data..
      this.allsgstReceivable = this.commonFillData?.sgstReceivable;
      if (this.allsgstReceivable?.length > 0) {
        this.taxTypeForm.patchValue({
          sgstReceivable: this.allsgstReceivable[0].ID
        });
      }
       //set cessPayables data..
      this.allcessPayables = this.commonFillData?.cessPayables;
      if (this.allcessPayables?.length > 0) {
        this.taxTypeForm.patchValue({
          cessPayables: this.allcessPayables[0].ID
        });
      }
       //set cessReceivable data..
      this.allcessReceivable = this.commonFillData?.cessReceivable;
      if (this.allcessReceivable?.length > 0) {
        this.taxTypeForm.patchValue({
          cessReceivable: this.allcessReceivable[0].ID
        });
      }
      this.fetchTaxTypeById();
    },
    error: (error) => {
      this.isLoading = false;
      console.error('An Error Occured', error);
    },
  });
}

fetchallTaxTypeMaster(): void {
  this.taxTypeService
  .getDetails(EndpointConstant.FILLTAXTYPEMASTER)
  .pipe(takeUntil(this.destroySubscription))
  .subscribe({
    next: (response) => {
      this.allTaxTypeMaster = response?.data;        
      this.selectedTaxTypeMasterId = this.allTaxTypeMaster[0].ID;
      this.firstTaxTypeMaster = this.allTaxTypeMaster[0].ID;
      //this.fetchTaxTypeById();
    },
    error: (error) => {
      this.isLoading = false;
      console.error('An Error Occured', error);
    },
  });
}
fetchTaxTypeById(): void {    
  //this.fetchBasicUnit();
  this.taxTypeService
  .getDetails(EndpointConstant.FILLTAXTYPEBYID+this.selectedTaxTypeMasterId)
  .pipe(takeUntil(this.destroySubscription))
  .subscribe({
    next: (response) => {
      this.currentTaxType = response?.data[0];
      this.taxTypeForm.patchValue({
        name: this.currentTaxType.name,
        type: this.currentTaxType.type,
        description: this.currentTaxType.description,
        purchasePerc: this.currentTaxType.purchasePerc,
        default: this.currentTaxType.isDefault,
        active: this.currentTaxType.active,
        salesPerc:this.currentTaxType.salesPerc,
        receivableAccount:this.currentTaxType.receivableAccountID,
        payableAccount:this.currentTaxType.payableAccountID,
        salePurcMode:this.currentTaxType.salePurchaseModeID,
        taxType:this.currentTaxType.taxMiscID,
        sgstReceivable:this.currentTaxType.sgstReceivableAccountID,
        sgstPayable:this.currentTaxType.sgstPayableAccountID,
        cgstReceivable:this.currentTaxType.cgstReceivableAccountID,
        cgstPayable:this.currentTaxType.cgstPayableAccountID,
        cess:this.currentTaxType.cessPerc,
        cessReceivable:this.currentTaxType.cessReceivable,
        cessPayables:this.currentTaxType.cessPayable,       
      });
     // this.selectedAreaGroupOption = this.currentAreaMaster.parentName ? this.currentAreaMaster.parentName : "";
     // this.selectedGroupId = this.currentAreaMaster.parentId;
      
    },
    error: (error) => {
      this.isLoading = false;
      console.error('An Error Occured', error);
    },
  });
}
onClickNewTaxTypeMaster(){
  if(!this.isCreate){
    this.baseService.showCustomDialogue('Permission Denied!');
    return false;
  }
  this.isInputDisabled = !this.isInputDisabled;
  this.isEditBtnDisabled = !this.isInputDisabled;
  this.isDeleteBtnDisabled = !this.isInputDisabled;
  this.isSaveBtnDisabled = this.isInputDisabled;
  this.taxTypeForm.reset();
  if(this.isInputDisabled == true){
    this.disbaleFormControls();
    this.selectedTaxTypeMasterId = this.firstTaxTypeMaster;
    this.fetchTaxTypeById();
  } else{
    this.selectedTaxTypeMasterId = 0;
    this.enableFormControls(); 
    this.taxTypeForm.patchValue({
      active:true,
      default:false
    });     
  }
  return true;
}
onClickEditTaxTypeMaster(){
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
  this.fetchTaxTypeById();
  this.onTypeSelected();
  this.oncessPayablesSelected();
  this.oncessReceivableSelected();
  this.oncgstPayableSelected();
  this.oncgstReceivableSelected();
  this.onpayableAccountSelected();
  this.onreceivableAccountSelected();
  this.onsalePurcModeSelected();
  this.onsgstPayableSelected();
  this.onsgstReceivableSelected();
  this.ontaxTypeSelected();
  return true;
}
onClickDeleteTaxTypeMaster(){
  if(!this.isDelete){
    this.baseService.showCustomDialogue('Permission Denied!');
    return false;
  }
  if(confirm("Are you sure you want to delete this details?")) {
    this.isLoading = true;
    this.taxTypeService.deleteDetails(EndpointConstant.DELETETAXTYPE+this.selectedTaxTypeMasterId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.baseService.showCustomDialogue(response.data.msg);          
        this.selectedTaxTypeMasterId = this.firstTaxTypeMaster;
        this.fetchallTaxTypeMaster();
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
onClickTaxTypeMaster(event:any): void {
  if (event.type === 'click') {
    this.selectedTaxTypeMasterId = event.row.ID;
    this.fetchTaxTypeById();
  }
}
onTypeSelected() { 
 
  this.typeOptions = this.taxTypeForm.get("type");

  if (this.typeOptions === "") {
    this.selectedTypeId = "";
  } else {
    const selectedOptionId = this.typeOptions.value; // Convert option to number
    this.selectedTypeId = selectedOptionId.toString();

    // Find the selected option in the list
    // const selectedItem = this.allType.find(item => item.ID === this.selectedTypeId);
    // if (selectedItem) {
      this.selectedTypeName = selectedOptionId.toString();
    // }
  }
}
enableFormControls(){
  this.taxTypeForm.get('name')?.enable();
  this.taxTypeForm.get('type')?.enable();
  this.taxTypeForm.get('description')?.enable();
  this.taxTypeForm.get('purchasePerc')?.enable();
  this.taxTypeForm.get('salesPerc')?.enable();
  this.taxTypeForm.get('default')?.enable();
  this.taxTypeForm.get('active')?.enable();
  this.taxTypeForm.get('salePurcMode')?.enable();
  this.taxTypeForm.get('taxType')?.enable();
  this.taxTypeForm.get('receivableAccount')?.enable();
  this.taxTypeForm.get('payableAccount')?.enable();
  this.taxTypeForm.get('cgstPayable')?.enable();
  this.taxTypeForm.get('sgstPayable')?.enable();
  this.taxTypeForm.get('cgstReceivable')?.enable();
  this.taxTypeForm.get('sgstReceivable')?.enable();
  this.taxTypeForm.get('cessPayables')?.enable();
  this.taxTypeForm.get('cessReceivable')?.enable();
  this.taxTypeForm.get('cess')?.enable();
}

disbaleFormControls(){
  this.taxTypeForm.get('name')?.disable();
  this.taxTypeForm.get('type')?.disable();
  this.taxTypeForm.get('description')?.disable();
  this.taxTypeForm.get('purchasePerc')?.disable();
  this.taxTypeForm.get('salesPerc')?.disable();
  this.taxTypeForm.get('default')?.disable();
  this.taxTypeForm.get('active')?.disable();
  this.taxTypeForm.get('salePurcMode')?.disable();
  this.taxTypeForm.get('taxType')?.disable();
  this.taxTypeForm.get('receivableAccount')?.disable();
  this.taxTypeForm.get('payableAccount')?.disable();
  this.taxTypeForm.get('cgstPayable')?.disable();
  this.taxTypeForm.get('sgstPayable')?.disable();
  this.taxTypeForm.get('cgstReceivable')?.disable();
  this.taxTypeForm.get('sgstReceivable')?.disable();
  this.taxTypeForm.get('cessPayables')?.disable();
  this.taxTypeForm.get('cessReceivable')?.disable();
  this.taxTypeForm.get('cess')?.disable();
}
// updateCallback(payload:any){
//   console.log(payload);
//   this.taxTypeService.updateDetails(EndpointConstant.SAVETAXTYPE,payload)
//     .pipe(takeUntil(this.destroySubscription))
//     .subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         this.baseService.showCustomDialogue("Successfully saved Area master"); 
//         this.selectedTaxTypeMasterId = this.firstTaxTypeMaster;
//         this.fetchTaxTypeById();
//         this.fetchallTaxTypeMaster();
//         this.setInitialState();
//       },
//       error: (error) => {
//         this.isLoading = false;
//         this.baseService.showCustomDialogue('Please try again');
//       },
//     });
// }

createCallback(payload:any){
  console.log("payload:", payload);
  this.taxTypeService.saveDetails(EndpointConstant.SAVETAXTYPE,payload)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.baseService.showCustomDialogue(response.data.msg); 
        this.selectedTaxTypeMasterId = this.firstTaxTypeMaster;
        this.fetchTaxTypeById();
        this.fetchallTaxTypeMaster();
        this.setInitialState();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving TaxType master', error);
        this.baseService.showCustomDialogue('Error saving TaxType master');
      },
    });
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
  
  const availableHeight = window.innerHeight - headerHeight - footerHeight - 100;
  const leftContentHeight = window.innerHeight - headerHeight - footerHeight - 50;
  
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
onreceivableAccountSelected() { 
 
  this.receivableAccountOptions = this.taxTypeForm.get("receivableAccount");

  if (this.receivableAccountOptions === "") {
    this.selectedreceivableAccountId = 0;
  } else {
    const selectedOptionId = Number(this.receivableAccountOptions.value); // Convert option to number
    this.selectedreceivableAccountId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allreceivableAccount.find(item => item.ID === this.selectedreceivableAccountId);
    if (selectedItem) {
      this.selectedreceivableAccountName = selectedItem.Name;
    }
  }
}
onpayableAccountSelected() { 
 
  this.payableAccountOptions = this.taxTypeForm.get("payableAccount");

  if (this.payableAccountOptions === "") {
    this.selectedpayableAccountId = 0;
  } else {
    const selectedOptionId = Number(this.payableAccountOptions.value); // Convert option to number
    this.selectedpayableAccountId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allpayableAccount.find(item => item.ID === this.selectedpayableAccountId);
    if (selectedItem) {
      this.selectedpayableAccountName = selectedItem.Name;
    }
  }
}
onsalePurcModeSelected() { 
 
  this.salePurModeOptions = this.taxTypeForm.get("salePurcMode");

  if (this.salePurModeOptions === "") {
    this.selectedsalePurModeId = 0;
  } else {
    const selectedOptionId = Number(this.salePurModeOptions.value); // Convert option to number
    this.selectedsalePurModeId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allsalePurMode.find(item => item.ID === this.selectedsalePurModeId);
    if (selectedItem) {
      this.selectedsalePurModeName = selectedItem.Value;
    }
  }
}
ontaxTypeSelected(){   
  this.saleTaxTypeOptions = this.taxTypeForm.get("taxType");
  if(this.saleTaxTypeOptions == "" ){
    this.selectedTaxTypeId = 0;
  }
  else {
    const selectedOptionId = Number(this.saleTaxTypeOptions.value); // Convert option to number
    this.selectedTaxTypeId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allTaxType.find(item => item.ID === this.selectedTaxTypeId);
    if (selectedItem) {
      this.selectedTaxTypeName = selectedItem.Value;
    }
  }
  
}
onsgstReceivableSelected(){   
  this.sgstReceivableOptions = this.taxTypeForm.get("sgstReceivable");
  if(this.sgstReceivableOptions == "" ){
    this.selectedsgstReceivableId = 0;
  }
  else {
    const selectedOptionId = Number(this.sgstReceivableOptions.value); // Convert option to number
    this.selectedsgstReceivableId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allcgstReceivable.find(item => item.ID === this.selectedsgstReceivableId);
    if (selectedItem) {
      this.selectedsgstReceivableName = selectedItem.Name;
    }
  }
  
}
onsgstPayableSelected(){   
  this.sgstPayableOptions = this.taxTypeForm.get("sgstPayable");
  if(this.sgstPayableOptions == "" ){
    this.selectedsgstPayableId = 0;
  }
  else {
    const selectedOptionId = Number(this.sgstPayableOptions.value); // Convert option to number
    this.selectedsgstPayableId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allsgstPayable.find(item => item.ID === this.selectedsgstPayableId);
    if (selectedItem) {
      this.selectedsgstReceivableName = selectedItem.Name;
    }
  }
  
}
oncgstReceivableSelected(){   
  this.cgstReceivableOptions = this.taxTypeForm.get("cgstReceivable");
  if(this.cgstReceivableOptions == "" ){
    this.selectedcgstReceivableId = 0;
  }
  else {
    const selectedOptionId = Number(this.cgstReceivableOptions.value); // Convert option to number
    this.selectedcgstReceivableId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allcgstReceivable.find(item => item.ID === this.selectedcgstReceivableId);
    if (selectedItem) {
      this.selectedcgstReceivableName = selectedItem.Name;
    }
  }
  
}
oncgstPayableSelected(){   
  this.cgstPayableOptions = this.taxTypeForm.get("cgstPayable");
  if(this.cgstPayableOptions == "" ){
    this.selectedcgstPayableId = 0;
  }
  else {
    const selectedOptionId = Number(this.cgstPayableOptions.value); // Convert option to number
    this.selectedcgstPayableId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allcgstPayable.find(item => item.ID === this.selectedcgstPayableId);
    if (selectedItem) {
      this.selectedcgstPayableName = selectedItem.Name;
    }
  }
  
}
oncessReceivableSelected(){   
  this.cessReceivableOptions = this.taxTypeForm.get("cessReceivable");
  if(this.cessReceivableOptions == "" ){
    this.selectedcessReceivableId = 0;
  }
  else {
    const selectedOptionId = Number(this.cessReceivableOptions.value); // Convert option to number
    this.selectedcessReceivableId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allcessReceivable.find(item => item.ID === this.selectedcessReceivableId);
    if (selectedItem) {
      this.selectedcessReceivableName = selectedItem.Name;
    }
  }
  
}
oncessPayablesSelected(){   
  this.cessPayablesOptions = this.taxTypeForm.get("cessPayables");
  if(this.cessPayablesOptions == "" ){
    this.selectedcessPayablesId = 0;
  }
  else {
    const selectedOptionId = Number(this.cessPayablesOptions.value); // Convert option to number
    this.selectedcessPayablesId = selectedOptionId;

    // Find the selected option in the list
    const selectedItem = this.allcessPayables.find(item => item.ID === this.selectedcessPayablesId);
    if (selectedItem) {
      this.selectedcessPayablesName = selectedItem.Name;
    }
  }
  
}
onClickSaveTaxTypemaster() {
  if (this.taxTypeForm.invalid) {
    for (const field of Object.keys(this.taxTypeForm.controls)) {
      const control: any = this.taxTypeForm.get(field);
      if (control.invalid) {
        this.baseService.showCustomDialogue('Invalid field: ' + field);
        return;  // Stop after showing the first invalid field
      }
    }
    return;
  }

  const payload = {
    "id":Number(this.selectedTaxTypeMasterId),
    "name": this.taxTypeForm.value.name,
    "type": {
          "id": 1, //this.selectedTypeId
          "value": this.selectedTypeName
        },
    "description": this.taxTypeForm.value.description,
    "purchasePerc": Number(this.taxTypeForm.value.purchasePerc),
    "default":  this.taxTypeForm.value.default ? this.taxTypeForm.value.default : false,
    "active":  this.taxTypeForm.value.active ? this.taxTypeForm.value.active : false,
    "salesPerc": Number(this.taxTypeForm.value.salesPerc),
    "cess_Perc": Number(this.taxTypeForm.value.cess),
    "sales_Pur_Mode": {
          "id": this.selectedsalePurModeId,
          "value": this.selectedsalePurModeName
        },
"taxType": {
          "id": this.selectedTaxTypeId,
          "value": this.selectedTaxTypeName
        },
      "receivableAccount": {
          "id": this.selectedreceivableAccountId,
          "value": this.selectedreceivableAccountName,
        }  ,
        "payableAccount": {
          "id": this.selectedpayableAccountId,
          "value": this.selectedpayableAccountName,
        }  , 
         "sgstReceivable": {
          "id": this.selectedsgstReceivableId,
          "value": this.selectedsgstReceivableName,
        }  , 
        "cgstReceivable": {
          "id": this.selectedcgstReceivableId,
          "value": this.selectedcgstReceivableName,
        }  , 
        "sgstPayable": {
          "id": this.selectedsgstPayableId,
          "value": this.selectedsgstPayableName,
        }  ,
        "cgstPayable": {
          "id": this.selectedcgstPayableId,
          "value": this.selectedcgstPayableName,
        }  ,
        "cessReceivable": {
          "id": this.selectedcessReceivableId,
          "value": this.selectedcessReceivableName,
        }  ,
        "cessPayable": {
          "id": this.selectedcessPayablesId,
          "value": this.selectedcessPayablesName,
        }  ,
  };
  // if(this.isUpdate){
  //   this.updateCallback(payload);
  // } else{
    this.createCallback(payload);
  // }
  // return;
}

}
