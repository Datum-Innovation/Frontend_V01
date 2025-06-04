import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { CurrencyService } from '../../services/currency.service';
import { ALLCURRENCIES, CURRENCY, CURRENCYCODES } from '../model/currency.interface';
declare var $: any;
@Component({
  selector: 'dfinance-frontend-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css'],
})
export class CurrencyComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  currencyMasterForm!: FormGroup;    
  currencyCodeForm!: FormGroup;    
  allCurrencyMaster = [] as Array<ALLCURRENCIES>;   
  selectedCurrencyMasterId = 0;
  firsTCurrencyMaster = 0;
  isActive: number = 0;
  currentCurrencyMaster = {} as CURRENCY;   
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isCodeUpdate: boolean = false;
  isLoading = false;

  allcurrencycodes = [] as Array<CURRENCYCODES>; 
  showCurrencyCodePopup = false;
  selectedCurrencyCodeId = 0;

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
    private currencyMasterService: CurrencyService,
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
    this.currencyMasterForm = this.formBuilder.group({      
      currencyname: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      currencycode: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      currencyrate: [{value: '', disabled: this.isInputDisabled},Validators.required],
      symbol: [{value: '', disabled: this.isInputDisabled}],
      coin: [{value: '', disabled: this.isInputDisabled}],
      isdefault: [{value: '', disabled: this.isInputDisabled}]
    });

    this.currencyCodeForm = this.formBuilder.group({      
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      name: ['', Validators.required]
    });

    
    this.fetchallCurrencyMaster();
    this.fetchCurrencyCode();

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

  fetchallCurrencyMaster(): void {
    this.currencyMasterService
    .getDetails(EndpointConstant.FILLCURRENCY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allCurrencyMaster = response?.data;        
        this.selectedCurrencyMasterId = this.allCurrencyMaster[0].currencyID;
        this.firsTCurrencyMaster = this.allCurrencyMaster[0].currencyID;
        this.fetchCurrencyMasterById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }
  
  fetchCurrencyCode(): void{
    this.currencyMasterService
    .getDetails(EndpointConstant.FILLCURRENCYCODE)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allcurrencycodes = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }  

  onClickCurrencyMaster(event:any): void {
    if (event.type === 'click') {
      this.selectedCurrencyMasterId = event.row.currencyID;
      this.fetchCurrencyMasterById();
    }
  }

  fetchCurrencyMasterById(): void {   
    this.currencyMasterService
    .getDetails(EndpointConstant.FILLCURRENCYMASTERBYID+this.selectedCurrencyMasterId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentCurrencyMaster = response?.data[0];
        this.currencyMasterForm.patchValue({
          currencyname: this.currentCurrencyMaster.currency,
          currencyrate: this.currentCurrencyMaster.currencyRate,
          symbol:this.currentCurrencyMaster.symbol ? this.currentCurrencyMaster.symbol: null,
          currencycode: this.currentCurrencyMaster.abbreviation,
          coin:this.currentCurrencyMaster.coin,
          isdefault: this.currentCurrencyMaster.defaultCurrency
        });
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewCurrencyMaster(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.currencyMasterForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCurrencyMasterId = this.firsTCurrencyMaster;
      this.fetchCurrencyMasterById();
    } else{
      this.selectedCurrencyMasterId = 0;
      this.enableFormControls();   
    }
    return true;
  }

  onClickEditCrrencyMaster(){
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
    this.fetchCurrencyMasterById();
    return true;
  }

  onClickDeleteCurrencyMaster(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.currencyMasterService.deleteDetails(EndpointConstant.DELETECURRENCYMASTER+this.selectedCurrencyMasterId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data);          
          this.selectedCurrencyMasterId = this.firsTCurrencyMaster;
          this.fetchallCurrencyMaster();
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

  onClickSaveCurrencymaster() {
    if (this.currencyMasterForm.invalid) {
      for (const field of Object.keys(this.currencyMasterForm.controls)) {
        const control: any = this.currencyMasterForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }

    let currencyCodeObj = {};
    if(this.currencyMasterForm.value.currencycode){
      this.allcurrencycodes.forEach(element => {
        if(element.code == this.currencyMasterForm.value.currencycode){
          currencyCodeObj = {
            "id": element.id,
            "key": element.code,
            "value": element.name
          };
        }
      });
    }
    const payload = {
      "currencyName": this.currencyMasterForm.value.currencyname,
      "currencyCode": currencyCodeObj,
      "currencyRate": this.currencyMasterForm.value.currencyrate,
      "symbol" : this.currencyMasterForm.value.symbol,
      "isDefault": this.currentCurrencyMaster.defaultCurrency ? true : false,
      "coin": this.currencyMasterForm.value.coin
    };
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.currencyMasterService.updateDetails(EndpointConstant.UPDATECURRENCYMASTER+this.selectedCurrencyMasterId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue("Successfully saved Currency master"); 
          this.selectedCurrencyMasterId = this.firsTCurrencyMaster;
          this.fetchCurrencyMasterById();
          this.fetchallCurrencyMaster();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.currencyMasterService.saveDetails(EndpointConstant.SAVECURRENCYMASTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Successfully saved Currency master'); 
          this.selectedCurrencyMasterId = this.firsTCurrencyMaster;
          this.fetchCurrencyMasterById();
          this.fetchallCurrencyMaster();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Area master', error);
        },
      });
  }

  enableFormControls(){
    this.currencyMasterForm.get('currencyname')?.enable();
    this.currencyMasterForm.get('currencycode')?.enable();
    this.currencyMasterForm.get('currencyrate')?.enable();
    this.currencyMasterForm.get('symbol')?.enable();
    this.currencyMasterForm.get('coin')?.enable();
    // this.currencyMasterForm.get('isdefault')?.enable();
  }

  disbaleFormControls(){
    this.currencyMasterForm.get('currencyname')?.disable();
    this.currencyMasterForm.get('currencycode')?.disable();
    this.currencyMasterForm.get('currencyrate')?.disable();
    this.currencyMasterForm.get('symbol')?.disable();
    this.currencyMasterForm.get('coin')?.disable();
    // this.currencyMasterForm.get('isdefault')?.disable();
  }

  togglePopup(){
    this.showCurrencyCodePopup = !this.showCurrencyCodePopup;
    this.currencyCodeForm.reset();
    this.isCodeUpdate = false;
  }

  editCurrencyCode(currencyID:any){    
    this.selectedCurrencyCodeId = currencyID;
    this.isCodeUpdate = true;
    this.currencyMasterService
    .getDetails(EndpointConstant.FILLCURRENCYCODEBYID+this.selectedCurrencyCodeId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        let currencyCodeData = response?.data[0];
        this.currencyCodeForm.patchValue({
          code: currencyCodeData.code,
          name: currencyCodeData.name
        });   
        this.showCurrencyCodePopup = !this.showCurrencyCodePopup;     
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  deleteCurrencyCode(currencyID:any){
    this.selectedCurrencyCodeId = currencyID;
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.currencyMasterService.deleteDetails(EndpointConstant.DELETECURRENCYCODE+this.selectedCurrencyCodeId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data);
          this.fetchCurrencyCode();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
    }
  }

  saveCurrencyCode(){
    if (this.currencyCodeForm.invalid) {
      for (const field of Object.keys(this.currencyCodeForm.controls)) {
        const control: any = this.currencyCodeForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    
    const payload = {
      "code": this.currencyCodeForm.value.code,
      "name": this.currencyCodeForm.value.name
    };
    // save code here 
    if(this.isCodeUpdate){
      this.updateCodeCallback(payload);
    } else{
      this.createCodeCallback(payload);
    }
  }

  updateCodeCallback(payload:any){
    this.currencyMasterService.updateDetails(EndpointConstant.UPDATECURRENCYCODE+this.selectedCurrencyCodeId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response?.httpCode == 500){
            this.baseService.showCustomDialogue(response?.data);
          } else{
            this.baseService.showCustomDialogue("Successfully saved Currency Code"); 
            this.fetchCurrencyCode();
            this.togglePopup();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCodeCallback(payload:any){
    this.currencyMasterService.saveDetails(EndpointConstant.SAVECURRENCYCODE,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Successfully saved Currency Code'); 
          this.fetchCurrencyCode();
          this.togglePopup();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Currency Code', error);
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
