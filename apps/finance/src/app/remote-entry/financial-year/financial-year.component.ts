import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { CardMasterService } from '../../services/cardmaster.service';
import { ALLFINANCIALYEAR, FINANCIALYEAR } from '../model/financialyear.interface';
import { DatePipe, formatDate } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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
  selector: 'dfinance-frontend-financial-year',
  templateUrl: './financial-year.component.html',
  styleUrls: ['./financial-year.component.css'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
  ]
})
export class FinancialYearComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  financialYearForm!: FormGroup;  
  allFinancialYear = [] as Array<ALLFINANCIALYEAR>;   
  selectedFinancialYearId = 0;
  firstFinancialYear = 0;
  isActive: number = 0;
  currentFinancialYear = {} as FINANCIALYEAR;   
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isCodeUpdate: boolean = false;
  isLoading = false;

  statusList:any = [
    {
      "value":"R",
      "name":"Current"
    },
    {
      "value":"C",
      "name":"Closed"
    },
    {
      "value":"O",
      "name":"Others"
    }
  ];
 
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
    private cardMasterService: CardMasterService,
    private store: Store,
    private router:Router,
    private route: ActivatedRoute,    
    private datePipe: DatePipe,
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
    this.financialYearForm = this.formBuilder.group({      
      financeyear: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      startdate: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      enddate: [{value: '', disabled: this.isInputDisabled},Validators.required],
      locktilldate: [{value: '', disabled: this.isInputDisabled},Validators.required],
      status: [{value: '', disabled: this.isInputDisabled},Validators.required],
    });
   
    this.fetchAllFinancialYear();

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

  fetchAllFinancialYear(): void {
    this.cardMasterService
    .getDetails(EndpointConstant.FILLALLFINANCIALYEAR)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allFinancialYear = response?.data;        
        this.selectedFinancialYearId = this.allFinancialYear[0].finYearID;
        this.firstFinancialYear = this.allFinancialYear[0].finYearID;
        this.fetchCardMasterById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickFinancialYear(event:any): void {
    if (event.type === 'click') {
      this.selectedFinancialYearId = event.row.finYearID;
      this.fetchCardMasterById();
    }
  }

  fetchCardMasterById(): void {   
    this.cardMasterService
    .getDetails(EndpointConstant.FILLFINANCIALYEARBYID+this.selectedFinancialYearId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentFinancialYear = response?.data[0];

        let startDate = null;
        let endDate = null;
        let lockTillDate = null;

        if(this.currentFinancialYear.startDate != null){
          startDate = this.datePipe.transform(new Date(this.currentFinancialYear.startDate), 'yyyy-MM-dd');
        }
        if(this.currentFinancialYear.endDate != null){
          endDate = this.datePipe.transform(new Date(this.currentFinancialYear.endDate), 'yyyy-MM-dd');
        }
        if(this.currentFinancialYear.lockTillDate != null){
          lockTillDate = this.datePipe.transform(new Date(this.currentFinancialYear.lockTillDate), 'yyyy-MM-dd');
        }

        this.financialYearForm.patchValue({
          financeyear: this.currentFinancialYear.finYearCode,
          startdate: startDate,
          enddate: endDate,
          locktilldate: lockTillDate,
          status:this.currentFinancialYear.status
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewFinancialYear(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.financialYearForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedFinancialYearId = this.firstFinancialYear;
      this.fetchCardMasterById();
    } else{
      this.selectedFinancialYearId = 0;
      this.enableFormControls();   
    }
    return true;

  }

  onClickEditFinancialYear(){
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
    this.fetchCardMasterById();
    return true;
  }

  onClickDeleteFinancialYear(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.cardMasterService.deleteDetails(EndpointConstant.DELETEFINANCIALYEAR+this.selectedFinancialYearId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue('Financial Year successfully deleted');          
            this.selectedFinancialYearId = this.firstFinancialYear;
            this.fetchAllFinancialYear();
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
    return true;
  }

  onClickSaveFinancialYear() {
    if (this.financialYearForm.invalid) {
      for (const field of Object.keys(this.financialYearForm.controls)) {
        const control: any = this.financialYearForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    
    const selectedsDate = this.financialYearForm.value.startdate;
    // Create a JavaScript Date object from the provided date components
    const sDateisoString = selectedsDate ? (this.convertToLocalDateString(new Date(selectedsDate))) : null;
   

    const selectedeDate = this.financialYearForm.value.enddate;
    // Create a JavaScript Date object from the provided date components
    const eDateisoString = selectedeDate ? (this.convertToLocalDateString(new Date(selectedeDate))) : null;
    
    const selectedlockDate = this.financialYearForm.value.locktilldate;
    // Create a JavaScript Date object from the provided date components
    const lockDateisoString = selectedlockDate ? (this.convertToLocalDateString(new Date(selectedlockDate))) : null;
    

    const payload = {
      "financeYear":this.financialYearForm.value.financeyear,
      "startDate": sDateisoString,
      "endDate": eDateisoString,
      "lockTillDate": lockDateisoString,
      "status": this.financialYearForm.value.status,
    }
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.cardMasterService.updateDetails(EndpointConstant.UPDATEFINANCIALYEAR+this.selectedFinancialYearId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 201){
            this.baseService.showCustomDialogue("Successfully saved Financial Year"); 
            this.selectedFinancialYearId = this.firstFinancialYear;
            this.fetchCardMasterById();
            this.fetchAllFinancialYear();
            this.setInitialState();
          }
          if(response.httpCode == 500){
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
    this.cardMasterService.saveDetails(EndpointConstant.SAVEFINANCIALYEAR,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(response.httpCode == 201){
            this.baseService.showCustomDialogue('Successfully saved Financial Year'); 
            this.selectedFinancialYearId = this.firstFinancialYear;
            this.fetchCardMasterById();
            this.fetchAllFinancialYear();
            this.setInitialState();
          }
          if(response.httpCode == 500){
            this.baseService.showCustomDialogue(response.data);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Financial Year', error);
        },
      });
  }

  enableFormControls(){
    this.financialYearForm.get('financeyear')?.enable();
    this.financialYearForm.get('startdate')?.enable();
    this.financialYearForm.get('enddate')?.enable();
    this.financialYearForm.get('locktilldate')?.enable();
    this.financialYearForm.get('status')?.enable();
  }

  disbaleFormControls(){
    this.financialYearForm.get('financeyear')?.disable();
    this.financialYearForm.get('startdate')?.disable();
    this.financialYearForm.get('enddate')?.disable();
    this.financialYearForm.get('locktilldate')?.disable();
    this.financialYearForm.get('status')?.disable();
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
  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    // Destroy DataTables when the component is destroyed
    // if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
    //   $(this.table.nativeElement).DataTable().destroy();
    // }
  }
}
