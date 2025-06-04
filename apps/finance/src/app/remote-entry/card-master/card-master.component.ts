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
  selector: 'dfinance-frontend-card-master',
  templateUrl: './card-master.component.html',
  styleUrls: ['./card-master.component.css'],
})
export class CardMasterComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  cardMasterForm!: FormGroup;  
  allCardMaster = [] as Array<ALLCARDMASTERS>;   
  selectedCardMasterId = 0;
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
    this.cardMasterForm = this.formBuilder.group({      
      description: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      accountname: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      commission: [{value: '', disabled: this.isInputDisabled},Validators.required],
      default: [{value: '', disabled: this.isInputDisabled}]
    });
   
    this.fetchallCardMaster();
    this.fetchAccountNamePopup();

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

  fetchallCardMaster(): void {
    this.cardMasterService
    .getDetails(EndpointConstant.FILLCARDMASTER)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allCardMaster = response?.data;        
        this.selectedCardMasterId = this.allCardMaster[0].id;
        this.firstCardMaster = this.allCardMaster[0].id;
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
    this.cardMasterForm.patchValue({
      accountname: option
    });
    this.selectedAccountName = option; 
  }

  onClickCardMaster(event:any): void {
    if (event.type === 'click') {
      this.selectedCardMasterId = event.row.id;
      this.fetchCardMasterById();
    }
  }

  fetchCardMasterById(): void {   
    this.cardMasterService
    .getDetails(EndpointConstant.FILLCARDMASTERBYID+this.selectedCardMasterId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentCardMaster = response?.data[0];
        this.cardMasterForm.patchValue({
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
    this.cardMasterForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCardMasterId = this.firstCardMaster;
      this.fetchCardMasterById();
    } else{
      this.selectedCardMasterId = 0;
      this.selectedAccountName = "";
      this.enableFormControls();   
    }
    return true;
  }

  onClickEditCardMaster(){
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

  onClickDeleteCardMaster(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.cardMasterService.deleteDetails(EndpointConstant.DELETECARDMASTER+this.selectedCardMasterId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue('Card master successfully deleted');          
            this.selectedCardMasterId = this.firstCardMaster;
            this.fetchallCardMaster();
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

  onClickSaveCardmaster() {
    if (this.cardMasterForm.invalid) {
      for (const field of Object.keys(this.cardMasterForm.controls)) {
        const control: any = this.cardMasterForm.get(field);
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
      "description": this.cardMasterForm.value.description,
      "accountName":accountObj,
      "commission": this.cardMasterForm.value.commission,
      "default": this.cardMasterForm.value.default,
    }
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.cardMasterService.updateDetails(EndpointConstant.UPDATECARDMASTER+this.selectedCardMasterId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue("Successfully saved Card master"); 
            this.selectedCardMasterId = this.firstCardMaster;
            this.fetchCardMasterById();
            this.fetchallCardMaster();
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
            this.selectedCardMasterId = this.firstCardMaster;
            this.fetchCardMasterById();
            this.fetchallCardMaster();
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
    this.cardMasterForm.get('description')?.enable();
    this.cardMasterForm.get('accountname')?.enable();
    this.cardMasterForm.get('commission')?.enable();
    this.cardMasterForm.get('default')?.enable();
  }

  disbaleFormControls(){
    this.cardMasterForm.get('description')?.disable();
    this.cardMasterForm.get('accountname')?.disable();
    this.cardMasterForm.get('commission')?.disable();
    this.cardMasterForm.get('default')?.disable();
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
