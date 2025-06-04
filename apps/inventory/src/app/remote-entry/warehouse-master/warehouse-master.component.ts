import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { WarehouseMasterService } from '../../services/warehousemaster.service';
import { WAREHOUSEMASTER, WAREHOUSEMASTERS, WAREHOUSETYPES } from '../model/warehousemaster.interface';
declare var $: any;
@Component({
  selector: 'dfinance-frontend-warehouse-master',
  templateUrl: './warehouse-master.component.html',
  styleUrls: ['./warehouse-master.component.css'],
})
export class WarehouseMasterComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  warehouseMasterForm!: FormGroup;    
  allWarehouseMasters = [] as Array<WAREHOUSEMASTERS>;   
  selectedWarehouseMasterId = 0;
  firstWarehouseMaster = 0;
  isActive: number = 0;
  currentWarehouseMaster = {} as WAREHOUSEMASTER;   
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;
  warehouseTypes = {} as  Array<WAREHOUSETYPES>;    
  selectedWarehouseTypeId !: string;  
  selectedWarehouseType = {} as WAREHOUSETYPES;
  showOtherDetails = false;
  
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
    private warehouseMasterService: WarehouseMasterService,
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
    this.warehouseMasterForm = this.formBuilder.group({ 
      type: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      code: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      name: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      address: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      remarks: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      active: [{value: true, disabled: this.isInputDisabled}],
      isdefault: [{value: '', disabled: this.isInputDisabled}],
      clearingchargepercft: [{value: '', disabled: this.isInputDisabled}],
      groundrentpercft: [{value: '', disabled: this.isInputDisabled}],
      lottingperpiece: [{value: '', disabled: this.isInputDisabled}],
      lorryhirepercft: [{value: '', disabled: this.isInputDisabled}],
    });
    this.fetchallWarehouseMasters();
    this.fetchWarehouseType();
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

  fetchallWarehouseMasters(): void {
    this.warehouseMasterService
    .getDetails(EndpointConstant.FILLALLWAREHOUSEMASTERS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allWarehouseMasters = response?.data;        
        this.selectedWarehouseMasterId = this.allWarehouseMasters[0].id;
        this.firstWarehouseMaster = this.allWarehouseMasters[0].id;
        this.fetchWarehouseMasterById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchWarehouseType(): void {
    this.warehouseMasterService
    .getDetails(EndpointConstant.FILLWAREHOUSETYPES)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.warehouseTypes = response?.data;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickWarehouseMaster(event:any): void {
    if (event.type === 'click') {
      this.selectedWarehouseMasterId = event.row.id;
      this.fetchWarehouseMasterById();
    }
  }

  fetchWarehouseMasterById(): void { 
    this.warehouseMasterService
    .getDetails(EndpointConstant.FILLWAREHOUSEMASTERBYID+this.selectedWarehouseMasterId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentWarehouseMaster = response?.data;
        let warehouseById = this.currentWarehouseMaster?.warehouseView.warehousebyid;
        let warehousebranch = this.currentWarehouseMaster?.warehouseView.warehousebranch[0];
        this.warehouseMasterForm.patchValue({
          type: warehouseById.locationTypeID,
          code: warehouseById.code,
          name: warehouseById.name,
          address: warehouseById.address,
          remarks: warehouseById.remarks,
          active: warehousebranch.active,
          isdefault: warehousebranch.isDefault,
          clearingchargepercft: warehouseById.clearingPerCFT,
          groundrentpercft: warehouseById.groundRentPerCFT,
          lottingperpiece: warehouseById.lottingPerPiece,
          lorryhirepercft: warehouseById.lorryHirePerCFT
        });   
        this.onSelectWarehouseType();     
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewWarehouseMaster(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.warehouseMasterForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedWarehouseMasterId = this.firstWarehouseMaster;
      this.fetchWarehouseMasterById();
    } else{
      this.selectedWarehouseMasterId = 0;
      this.enableFormControls(); 
      this.warehouseMasterForm.patchValue({
        active:true
      });   
    }
    return true;
  }

  onClickEditWarehouseMaster(){
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
    this.fetchWarehouseMasterById();
    return true;
  }

  onClickDeleteWarehouseMaster(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.warehouseMasterService.deleteDetails(EndpointConstant.DELETEWAREHOUSEMASTER+this.selectedWarehouseMasterId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data?.msg);          
          this.selectedWarehouseMasterId = this.firstWarehouseMaster;
          this.fetchallWarehouseMasters();
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

  onClickSaveWarehouseMaster() {
    if (this.warehouseMasterForm.invalid) {
      for (const field of Object.keys(this.warehouseMasterForm.controls)) {
        const control: any = this.warehouseMasterForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }

    const payload = {
      "id": this.isUpdate ? this.selectedWarehouseMasterId : 0,
      "type": this.selectedWarehouseType,
      "code": this.warehouseMasterForm.get('code')?.value,
      "name": this.warehouseMasterForm.get('name')?.value,
      "address": this.warehouseMasterForm.get('address')?.value,
      "remarks": this.warehouseMasterForm.get('remarks')?.value,
      "active": this.warehouseMasterForm.get('active')?.value ? 1 : 0,
      "isDefault": this.warehouseMasterForm.get('isdefault')?.value ? 1 : 0,
      "clearingChargePerCFT":this.warehouseMasterForm.get('clearingchargepercft')?.value,
      "groundRentPerCFT": this.warehouseMasterForm.get('groundrentpercft')?.value,
      "lottingPerPiece": this.warehouseMasterForm.get('lottingperpiece')?.value,
      "lorryHirePerCFT": this.warehouseMasterForm.get('lorryhirepercft')?.value,
    }


    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    console.log("update payload:"+JSON.stringify(payload,null,2))
    this.warehouseMasterService.updateDetails(EndpointConstant.UPDATEWAREHOUEMASTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response?.httpCode == 201){
            this.baseService.showCustomDialogue("Successfully saved Warehouse master"); 
            this.selectedWarehouseMasterId = this.firstWarehouseMaster;
            this.fetchWarehouseMasterById();
            this.fetchallWarehouseMasters();
            this.setInitialState();
          } else{
            this.baseService.showCustomDialogue(response?.data); 
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.warehouseMasterService.saveDetails(EndpointConstant.SAVEWAREHOUSEMASTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Successfully saved Warehouse master'); 
          this.selectedWarehouseMasterId = this.firstWarehouseMaster;
          this.fetchWarehouseMasterById();
          this.fetchallWarehouseMasters();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Warehouse master', error);
        },
      });
  }

  onSelectWarehouseType(){
    this.showOtherDetails = false;
    this.selectedWarehouseTypeId = this.warehouseMasterForm?.get('type')?.value;
    this.selectedWarehouseType = this.warehouseTypes?.find((obj:any) => obj?.id == this.selectedWarehouseTypeId) as WAREHOUSETYPES;
    if(this.selectedWarehouseType.name == 'LANDING PORT'){
      this.showOtherDetails = true;
    } else{
      this.warehouseMasterForm.patchValue({
        clearingchargepercft: null,
        groundrentpercft:null,
        lottingperpiece: null,
        lorryhirepercft: null
      });
    }
  }

  enableFormControls(){
    this.warehouseMasterForm.get('type')?.enable();
    this.warehouseMasterForm.get('code')?.enable();
    this.warehouseMasterForm.get('name')?.enable();
    this.warehouseMasterForm.get('address')?.enable();
    this.warehouseMasterForm.get('remarks')?.enable();
    this.warehouseMasterForm.get('active')?.enable();
    this.warehouseMasterForm.get('isdefault')?.enable();
    this.warehouseMasterForm.get('clearingchargepercft')?.enable();
    this.warehouseMasterForm.get('groundrentpercft')?.enable();
    this.warehouseMasterForm.get('lottingperpiece')?.enable();
    this.warehouseMasterForm.get('lorryhirepercft')?.enable();
  }

  disbaleFormControls(){
    this.warehouseMasterForm.get('type')?.disable();
    this.warehouseMasterForm.get('code')?.disable();
    this.warehouseMasterForm.get('name')?.disable();
    this.warehouseMasterForm.get('address')?.disable();
    this.warehouseMasterForm.get('remarks')?.disable();
    this.warehouseMasterForm.get('active')?.disable();
    this.warehouseMasterForm.get('isdefault')?.disable();
    this.warehouseMasterForm.get('clearingchargepercft')?.disable();
    this.warehouseMasterForm.get('groundrentpercft')?.disable();
    this.warehouseMasterForm.get('lottingperpiece')?.disable();
    this.warehouseMasterForm.get('lorryhirepercft')?.disable();
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
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight - 40;
    
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
