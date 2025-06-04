import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
// import { Designation, Designations } from '../model/designation.interface';
 import { UnitMasterService } from '../../services/unitmaster.service';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { BASICUNIT, UNITMASTER, UNITMASTERS } from '../model/unitmaster.interface';
import { integerValidator } from '../../validators/integer-validator'; 
declare var $: any;

@Component({
  selector: 'dfinance-frontend-unitmaster',
  templateUrl: './unitmaster.component.html',
  styleUrls: ['./unitmaster.component.css'],
})
export class UnitmasterComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  unitMasterForm!: FormGroup;    
  allUnitMaster = [] as Array<UNITMASTERS>; 
  selectedUnitMasterUnit = "";
  firstUnitMaster = "";
  isActive: number = 0;
  currentUnitMaster = {} as UNITMASTER;
  baiscUnitData: BASICUNIT[] = [];
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;
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
    private unitMasterService: UnitMasterService,
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
    this.unitMasterForm = this.formBuilder.group({      
      unit: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      basicunit: [{value: '', disabled: this.isInputDisabled}],
      precision: [{value: '', disabled: this.isInputDisabled}, [Validators.required, integerValidator()]],
      description: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      arabicname: [{value: '', disabled: this.isInputDisabled}], 
      active: [{value: true, disabled: this.isInputDisabled}],
      factor: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      iscomplex: [{value: '', disabled: this.isInputDisabled}] 
    });
    this.fetchallUnitMaster();
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

  fetchallUnitMaster(): void {
    this.unitMasterService
    .getDetails(EndpointConstant.FILLALLUNITMASTER)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allUnitMaster = response?.data;        
        //this.setBranches();
        this.selectedUnitMasterUnit = this.allUnitMaster[0].unit;
        this.firstUnitMaster = this.allUnitMaster[0].unit;
        this.fetchUnitMasterById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }
  
  fetchBasicUnit(): void{
    this.unitMasterService
    .getDetails(EndpointConstant.FILLUNITMASTERUNITDROPDOWN)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.baiscUnitData = response?.data;       
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }  

  onClickUnitMaster(event:any): void {
    if (event.type === 'click') {
      this.selectedUnitMasterUnit = event.row.unit;
      this.fetchUnitMasterById();
    }
  }

  fetchUnitMasterById(): void {    
    this.fetchBasicUnit();
    this.unitMasterService
    .getDetails(EndpointConstant.FILLUNITMASTERBYNAME+this.selectedUnitMasterUnit)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentUnitMaster = response?.data[0];
        this.unitMasterForm.patchValue({
          unit: this.currentUnitMaster.unit,
          basicunit: this.currentUnitMaster.basicUnit,
          precision: this.currentUnitMaster.precision,
          description: this.currentUnitMaster.description,
          arabicname: this.currentUnitMaster.arabicName,
          active: this.currentUnitMaster.active,
          factor: this.currentUnitMaster.factor,
          iscomplex: this.currentUnitMaster.isComplex
        });
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewUnitMaster(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.unitMasterForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedUnitMasterUnit = this.firstUnitMaster;
      this.fetchUnitMasterById();
    } else{
      this.selectedUnitMasterUnit = "";
      this.enableFormControls();      
    }
    return true;
  }

  onClickEditUnitMaster(){
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
      this.unitMasterForm.get('unit')?.disable();
    } else{
      this.disbaleFormControls();
    }
    this.fetchUnitMasterById();
    return true;
  }

  onClickDeleteUnitMaster(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.unitMasterService.deleteDetails(EndpointConstant.DELETEUNITMASTER+this.selectedUnitMasterUnit)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedUnitMasterUnit = this.firstUnitMaster;
          this.fetchallUnitMaster();
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

  onClickSaveUnitmaster() {
    if (this.unitMasterForm.invalid) {
      for (const field of Object.keys(this.unitMasterForm.controls)) {
        const control: any = this.unitMasterForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    //fetch basic unit...
    let basicUnit:any = {
      "id": 0,
      "value": this.unitMasterForm.getRawValue().unit
    };
    if(this.unitMasterForm.value.basicunit){
      let foundUnit = this.baiscUnitData.find(item => item.unit === this.unitMasterForm.value.basicunit);
      if(foundUnit){
        basicUnit = {
          "id":foundUnit.id,
          "value":foundUnit.unit
        }
      }
    }

    const payload = {
      "unit": this.unitMasterForm.getRawValue().unit,
      "basicUnit": basicUnit,
      "precision": this.unitMasterForm.value.precision,
      "description": this.unitMasterForm.value.description,
      "arabicName": this.unitMasterForm.value.arabicname,
      "active": this.unitMasterForm.value.active ? this.unitMasterForm.value.active : false,
      "factor": this.unitMasterForm.value.factor,
      "isComplex": this.unitMasterForm.value.iscomplex? this.unitMasterForm.value.iscomplex : false
    };
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.unitMasterService.updateDetails(EndpointConstant.UPDATEUNITMASTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 500){
            this.baseService.showCustomDialogue(response.data.msg);
          }
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue("Successfully saved Unit master"); 
            this.selectedUnitMasterUnit = this.firstUnitMaster;
            this.fetchUnitMasterById();
            this.fetchallUnitMaster();
            this.setInitialState();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.unitMasterService.saveDetails(EndpointConstant.SAVEUNITMASTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 500){
            this.baseService.showCustomDialogue(response.data.msg);
          }
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue('Successfully saved Unit master'); 
            this.selectedUnitMasterUnit = this.firstUnitMaster;
            this.fetchUnitMasterById();
            this.fetchallUnitMaster();
            this.setInitialState();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Unit master', error);
        },
      });
  }

  enableFormControls(){
    this.unitMasterForm.get('unit')?.enable();
    this.unitMasterForm.get('basicunit')?.enable();
    this.unitMasterForm.get('precision')?.enable();
    this.unitMasterForm.get('description')?.enable();
    this.unitMasterForm.get('arabicname')?.enable();
    this.unitMasterForm.get('active')?.enable();
    this.unitMasterForm.get('factor')?.enable();
    this.unitMasterForm.get('iscomplex')?.enable();
  }

  disbaleFormControls(){
    this.unitMasterForm.get('unit')?.disable();
    this.unitMasterForm.get('basicunit')?.disable();
    this.unitMasterForm.get('precision')?.disable();
    this.unitMasterForm.get('description')?.disable();
    this.unitMasterForm.get('arabicname')?.disable();
    this.unitMasterForm.get('active')?.disable();
    this.unitMasterForm.get('factor')?.disable();
    this.unitMasterForm.get('iscomplex')?.disable();
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
