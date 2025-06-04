import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { CardMasterService } from '../../services/cardmaster.service';
import { ACCOUNTNAME, ALLCARDMASTERS, CARDMASTER } from '../model/cardmaster.interface';
declare var $: any;
@Component({
  selector: 'dfinance-frontend-ledgers',
  templateUrl: './ledgers.component.html',
  styleUrls: ['./ledgers.component.css'],
})
export class LedgersComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  ledgerForm!: FormGroup;  
  allLedgers = [] as Array<ALLCARDMASTERS>;   
  selectedLedgerId = 0;
  firstCardMaster = 0;
  isActive: number = 0;
  currentCardMaster = {} as CARDMASTER;   
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isCodeUpdate: boolean = false;
  isLoading = false;

  accountOptions:any = [];
  accountReturnField:string = 'name';
  accountNameKeys = ['ID','Name'];
  selectedAccountName = "";
  accountnameData= [] as Array<ACCOUNTNAME>;

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
    this.ledgerForm = this.formBuilder.group({      
      group: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      subgroup: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      accountcode: [{value: '', disabled: this.isInputDisabled},Validators.required],
      accountname: [{value: '', disabled: this.isInputDisabled},Validators.required],
      alternatename: [{value: '', disabled: this.isInputDisabled}],
      accountcategory: [{value: '', disabled: this.isInputDisabled}],
      isgroup: [{value: '', disabled: this.isInputDisabled}],
      maintainbillwise: [{value: '', disabled: this.isInputDisabled}],
      preventextrapay: [{value: '', disabled: this.isInputDisabled}],
      trackcollection: [{value: '', disabled: this.isInputDisabled}],
      maintaincostcenter: [{value: '', disabled: this.isInputDisabled}],
      narration: [{value: '', disabled: this.isInputDisabled}]      
    });
   
    //this.fetchallLedgers();
   // this.fetchAccountNamePopup();

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

  fetchallLedgers(): void {
    this.cardMasterService
    .getDetails(EndpointConstant.FILLCARDMASTER)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allLedgers = response?.data;        
        this.selectedLedgerId = this.allLedgers[0].id;
        this.firstCardMaster = this.allLedgers[0].id;
        this.fetchCardMasterById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }
  
  fetchAccountNamePopup(): void{
    this.cardMasterService
    .getDetails(EndpointConstant.FILLACCOUNTNAMEPOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.accountnameData = response?.data;
        this.accountOptions = this.accountnameData.map((item: any) => ({
          id:item.id,
          name: item.name
        }));
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }  

  onAccountNameSelected(option: string): void {    
    this.ledgerForm.patchValue({
      accountname: option
    });
    this.selectedAccountName = option; 
  }

  onClickLedgers(event:any): void {
    if (event.type === 'click') {
      this.selectedLedgerId = event.row.id;
      this.fetchCardMasterById();
    }
  }

  fetchCardMasterById(): void {   
    this.cardMasterService
    .getDetails(EndpointConstant.FILLCARDMASTERBYID+this.selectedLedgerId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentCardMaster = response?.data[0];
        this.ledgerForm.patchValue({
          description: this.currentCardMaster.description,
          accountname: this.currentCardMaster.accountName,
          commission:this.currentCardMaster.commission,
          default: this.currentCardMaster.default
        });
        
        this.selectedAccountName = this.currentCardMaster.accountName;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewCardMaster(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.ledgerForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedLedgerId = this.firstCardMaster;
      this.fetchCardMasterById();
    } else{
      this.selectedLedgerId = 0;
      this.selectedAccountName = "";
      this.enableFormControls();   
    }
    return true;
  }

  onClickEditLedger(){
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

  onClickDeleteLedger(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.cardMasterService.deleteDetails(EndpointConstant.DELETECARDMASTER+this.selectedLedgerId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue('Card master successfully deleted');          
            this.selectedLedgerId = this.firstCardMaster;
            this.fetchallLedgers();
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

  onClickSaveLedger() {
    if (this.ledgerForm.invalid) {
      for (const field of Object.keys(this.ledgerForm.controls)) {
        const control: any = this.ledgerForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    //getting account name object..
    let accountObj = {};console.log(this.selectedAccountName);
    this.accountnameData.forEach((item:any)=> {
      if (item.name === this.selectedAccountName) {console.log('selected---');
        accountObj = item;
      }
    });

    
    const payload = {
      "description": this.ledgerForm.value.description,
      "accountName":accountObj,
      "commission": this.ledgerForm.value.commission,
      "default": this.ledgerForm.value.default,
    }
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.cardMasterService.updateDetails(EndpointConstant.UPDATECARDMASTER+this.selectedLedgerId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue("Successfully saved Card master"); 
            this.selectedLedgerId = this.firstCardMaster;
            this.fetchCardMasterById();
            this.fetchallLedgers();
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
    this.cardMasterService.saveDetails(EndpointConstant.SAVECARDMASTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(response.httpCode == 201){
            this.baseService.showCustomDialogue('Successfully saved Card master'); 
            this.selectedLedgerId = this.firstCardMaster;
            this.fetchCardMasterById();
            this.fetchallLedgers();
            this.setInitialState();
          }
          if(response.httpCode == 500){
            this.baseService.showCustomDialogue(response.data);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Card master', error);
        },
      });
  }

  enableFormControls(){
    this.ledgerForm.get('group')?.enable();
    this.ledgerForm.get('subgroup')?.enable();
    this.ledgerForm.get('accountcode')?.enable();
    this.ledgerForm.get('accountname')?.enable();
    this.ledgerForm.get('alternatename')?.enable();
    this.ledgerForm.get('accountcategory')?.enable();
    this.ledgerForm.get('isgroup')?.enable();
    this.ledgerForm.get('maintainbillwise')?.enable();
    this.ledgerForm.get('preventextrapay')?.enable();
    this.ledgerForm.get('trackcollection')?.enable();
    this.ledgerForm.get('maintaincostcenter')?.enable();
    this.ledgerForm.get('narration')?.enable();
  }

  disbaleFormControls(){
    this.ledgerForm.get('group')?.disable();
    this.ledgerForm.get('subgroup')?.disable();
    this.ledgerForm.get('accountcode')?.disable();
    this.ledgerForm.get('accountname')?.disable();
    this.ledgerForm.get('alternatename')?.disable();
    this.ledgerForm.get('accountcategory')?.disable();
    this.ledgerForm.get('isgroup')?.disable();
    this.ledgerForm.get('maintainbillwise')?.disable();
    this.ledgerForm.get('preventextrapay')?.disable();
    this.ledgerForm.get('trackcollection')?.disable();
    this.ledgerForm.get('maintaincostcenter')?.disable();
    this.ledgerForm.get('narration')?.disable();
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
    
    // const availableHeight = window.innerHeight - headerHeight - footerHeight - 100;
    // const leftContentHeight = window.innerHeight - headerHeight - footerHeight - 40;
    const availableHeight = 400;
    const leftContentHeight = 400;
    const sections = document.querySelectorAll('.right-section');
    sections.forEach(section => {
      (section as HTMLElement).style.height = `${availableHeight}px`;
    });
    
    const leftsection = document.querySelectorAll('.datatable-body');
    leftsection.forEach(section => {
      (section as HTMLElement).style.height = `${leftContentHeight}px`;
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
