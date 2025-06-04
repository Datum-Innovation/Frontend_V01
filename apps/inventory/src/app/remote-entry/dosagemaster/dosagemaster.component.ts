import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { DosagemasterService } from '../../services/dosagemaster.service';
import { Subject, takeUntil } from 'rxjs';
import { DOSAGEMASTER, DOSAGEMASTERS } from '../model/dosagemaster.interface';

@Component({
  selector: 'dfinance-frontend-dosagemaster',
  templateUrl: './dosagemaster.component.html',
  styleUrls: ['./dosagemaster.component.css'],
})
export class DosagemasterComponent {
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  DosageComponentForm !: FormGroup; 
  isLoading=false;
  isInputDisabled: boolean = true;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isNewBtnDisabled: boolean = false;
  isUpdate: boolean = false;
  isOverlayVisible: boolean = false;
  destroySubscription: Subject<void> = new Subject<void>();
  pageId = 0;
  selecteddosage: number=0;
  firstdosage!: number;
  allDosageMaster =[] as Array<DOSAGEMASTER>;
  currentdosagemaster ={} as DOSAGEMASTERS;

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  constructor(
    private formBuilder: FormBuilder,
    private dosagemasterservice: DosagemasterService,
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

  ngOnInit(): void
  {
    this.DosageComponentForm= this.formBuilder.group({
      dosage: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      remarks: [{ value: '', disabled: this.isInputDisabled }],
      active: [{ value: '', disabled: this.isInputDisabled }],
    });
    this.fetchDosageMaster();
  }

  setInitialState(){
    this.isNewBtnDisabled=false;
    this.isEditBtnDisabled=false;
    this.isDeleteBtnDisabled=false;
    this.isSaveBtnDisabled=true;
    this.isInputDisabled=true;
    this.isUpdate=false;
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


  fetchDosageMaster(): void{

    //console.log("entering in the dosagemaster");
    this.dosagemasterservice
    .getDetails(EndpointConstant.FILLDOSAGEMASTER)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next : (response) =>{
        this.allDosageMaster = response?.data;
        this.selecteddosage = this.allDosageMaster[0].id;
        this.firstdosage = this.allDosageMaster[0].id;
        this.fetchDosageMasterById();

      },
      error: (error) => {
        this.isLoading=false;
        console.error('An error occured',error);
      }
    });
  }

  onClickDosageMaster(event:any):void{
    if(event.type ==='click'){
      this.selecteddosage = event.row.id;
      //console.log(this.selecteddosage);
      this.fetchDosageMasterById();
    }
  }

  fetchDosageMasterById():void{
    const url = `${EndpointConstant.FILLDOSAGEMASTER}?Id=${this.selecteddosage}`;

    console.log(url);

    this.dosagemasterservice.getDetails(url)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        // console.log('API Response:', response);
        this.currentdosagemaster = response?.data;
        // console.log('Current dosage data :', this.currentdosagemaster);

        this.DosageComponentForm.patchValue({
          dosage: this.currentdosagemaster.dosage,
          remarks: this.currentdosagemaster.remarks,
          active: this.currentdosagemaster.active,

        });
  },
  error: (error) => {
    this.isLoading = false;
    console.error('An Error Occured', error);
  },
});
}

  onClickNewDosageMaster()
  {
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.DosageComponentForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selecteddosage = this.firstdosage;
      this.fetchDosageMasterById();
  }
  else{
    this.selecteddosage = 0;
    this.enableFormControls();
  }
  return true;
}



onClickSaveDosageMaster(){
  if(this.DosageComponentForm.invalid){
    Object.keys(this.DosageComponentForm.controls).forEach(field=>{
      const control:any = this.DosageComponentForm.get(field);
      if(control.invalid){
        this.baseService.showCustomDialogue('Invalid Field'+field);
        return;
      }
    });
    return;

  }

  const payload ={
    "id": this.selecteddosage,
    "dosage": this.DosageComponentForm.value.dosage,
    "remarks": this.DosageComponentForm.value.remarks,
    "active": this.DosageComponentForm.value.active

  };
  this.createCallback(payload);
}

createCallback(payload:any){
  // console.log('Payload:', payload);
  this.dosagemasterservice.saveDetails(EndpointConstant.SAVEDOSAGEMASTER+this.pageId,payload)
  .pipe(takeUntil(this.destroySubscription))
  .subscribe({
    next :(response) => {
      this.isLoading = false;
      if(response.httpCode == 200){
        this.baseService.showCustomDialogue('Successfully saves Dosage');
        this.selecteddosage= this.firstdosage;
        this.fetchDosageMasterById();
        this.fetchDosageMaster();
        this.setInitialState();
      }
      if(response.httpCode == 500){
        this.baseService.showCustomDialogue(response.data);

      }
    },
    error : (error) =>{
      this.isLoading =false;
      console.error('Error saving Dosage',error);

    }
  });

}



onClickEditDosageMaster(){
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
  this.fetchDosageMasterById();
  return true;
}

onClickDeleteDosageMaster(){
  if(!this.isDelete){
    this.baseService.showCustomDialogue('Permission Denied!');
    return false;
  }
  if(confirm("Are you sure you want to delete this details?")){
    this.isLoading=true;
    
    this.dosagemasterservice.deleteDetails(EndpointConstant.DELETEDOSAGEMASTER+this.selecteddosage + '&PageId=' + this.pageId)
    .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data);          
          this.selecteddosage = this.firstdosage;
          this.fetchDosageMaster();
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


disbaleFormControls(){
  this.DosageComponentForm.get('dosage')?.disable();
  this.DosageComponentForm.get('remarks')?.disable();
  this.DosageComponentForm.get('active')?.disable();
 
  
}
enableFormControls(){
  this.DosageComponentForm.get('dosage')?.enable();
  this.DosageComponentForm.get('remarks')?.enable();
  this.DosageComponentForm.get('active')?.enable();
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

