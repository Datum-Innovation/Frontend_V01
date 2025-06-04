import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { SizeMasterService } from '../../services/sizemaster.service';
import { SIZEMASTERBYID, SIZEMASTERS } from '../model/sizemaster.interface';

@Component({
  selector: 'dfinance-frontend-sizemaster',
  templateUrl: './sizemaster.component.html',
  styleUrls: ['./sizemaster.component.css'],
})
export class SizemasterComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  sizeMasterForm!:FormGroup
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isInputDisabled: boolean = true;
  isLoading = false;
  selectedSizeMasterId!:number;
  allSizeMaster=[] as Array<SIZEMASTERS>; 
  currentSizemaster={} as SIZEMASTERBYID
  firstSizeMaster=0;
  pageId=0;
  
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  constructor(
    private formBuilder: FormBuilder,    
    private sizeMasterService: SizeMasterService,
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
    this.sizeMasterForm = this.formBuilder.group({      
      code: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      name: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      description: [{value: '', disabled: this.isInputDisabled}],     
      active: [{value: true, disabled: this.isInputDisabled}]
    });    
    this.fetchAllSizeMaster();
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

  onClickNewSizeMaster(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.sizeMasterForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedSizeMasterId = this.firstSizeMaster;
      this.fetchSizeMasterById();
    } else{
      this.selectedSizeMasterId = 0;
      this.enableFormControls(); 
      this.sizeMasterForm.patchValue({
        active:true,       
      });     
    }
    return true;
  }

  enableFormControls(){
    this.sizeMasterForm.get('code')?.enable();
    this.sizeMasterForm.get('name')?.enable();
    this.sizeMasterForm.get('description')?.enable();    
    this.sizeMasterForm.get('active')?.enable();
  }

  disbaleFormControls(){
    this.sizeMasterForm.get('code')?.disable();
    this.sizeMasterForm.get('name')?.disable();
    this.sizeMasterForm.get('description')?.disable();    
    this.sizeMasterForm.get('active')?.disable();
  }

  fetchAllSizeMaster(): void {
    this.sizeMasterService
    .getDetails(EndpointConstant.FILLSIZEMASTER)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allSizeMaster = response?.data;        
        this.selectedSizeMasterId = this.allSizeMaster[0].id;
        this.firstSizeMaster = this.allSizeMaster[0].id;
        this.fetchSizeMasterById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickSizeMaster(event:any): void {
    if (event.type === 'click') {
      this.selectedSizeMasterId = event.row.id;
      this.fetchSizeMasterById();
    }
  }

  setInitialState() {
    this.isNewBtnDisabled = false;
    this.isEditBtnDisabled = false;
    this.isDeleteBtnDisabled = false;
    this.isSaveBtnDisabled = true;
    this.isInputDisabled = true;
    this.isUpdate = false;
    this.disbaleFormControls();
  }
  fetchSizeMasterById(): void {
    this.sizeMasterService
      .getDetails(EndpointConstant.FILLSIZEMASTERBYID + this.selectedSizeMasterId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentSizemaster = response?.data;
          console.log(this.currentSizemaster);
          this.sizeMasterForm.patchValue({
            code: this.currentSizemaster.code,
            name: this.currentSizemaster.name,
            active: this.currentSizemaster.active,
            description: this.currentSizemaster.description            
          });
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },

      });
  }

  onClickSaveSizemaster() {
    if (this.sizeMasterForm.invalid) {
      for (const field of Object.keys(this.sizeMasterForm.controls)) {
        const control: any = this.sizeMasterForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    if(!this.isUpdate)
      this.selectedSizeMasterId=0;
    const payload = {
      id: this.selectedSizeMasterId,      
      code: this.sizeMasterForm.value.code,
      name: this.sizeMasterForm.value.name,
      description: this.sizeMasterForm.value.description,
      active:this.sizeMasterForm.value.active
    };
    this.createCallback(payload);
    
  }

  onClickEditSizeMaster() {
    if(!this.isEdit){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    return true;
  }

  createCallback(payload: any) {
    this.sizeMasterService.saveDetails(EndpointConstant.SAVESIZEMASTER + this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Successfully saved Size Master');
          this.selectedSizeMasterId = this.firstSizeMaster;
          this.fetchSizeMasterById();
          this.fetchAllSizeMaster();
          this.setInitialState();

        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Submasters', error);
        },
      });
  }

  onClickDeleteSizemaster() {
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if (confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;    
      this.sizeMasterService.deleteDetails(EndpointConstant.DELETESIZEMASTER + this.selectedSizeMasterId +'&pageId=' + this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.baseService.showCustomDialogue(response.data);
            this.selectedSizeMasterId = this.firstSizeMaster;
            this.fetchAllSizeMaster();
            this.setInitialState();
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            this.baseService.showCustomDialogue('Please try again');
          },
        });
    }
    return true;
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

