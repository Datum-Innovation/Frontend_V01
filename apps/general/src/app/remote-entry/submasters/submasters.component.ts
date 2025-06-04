import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { SubmasterService } from '../../services/submaster.service';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService, minLengthValidator, selectToken } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Keys, SubMaster } from '../model/submaster.interface';
import { FillMaster } from '../model/submaster.interface';

@Component({
  selector: 'dfinance-frontend-submasters',
  templateUrl: './submasters.component.html',
  styleUrls: ['./submasters.component.css'],
})
export class SubmastersComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  isInputDisabled: boolean = true;
  isLoading = false;
  isUpdate: boolean = false;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  selectedSubmaserId!: number;
  selectedKey = {} as Keys;
  selectedKeyValue!: string;
  allkeys = [] as Array<Keys>;
  fillsubmasters = [] as Array<FillMaster>
  currentSubmaster = {} as SubMaster
  submasterForm!: FormGroup;
  firstsubmaster!: number;
 
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
    private submasterService: SubmasterService,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private baseService:BaseService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
  }

  ngOnInit(): void {
    this.submasterForm = this.formBuilder.group({
      key: [{ value: '', disabled: false }, Validators.required],
      code: [{ value: '', disabled: this.isInputDisabled }],
      value: [{ value: '', disabled: this.isInputDisabled }],
      description: [{ value: '', disabled: this.isInputDisabled }],

    });   
    this.fetchAllKeys();
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

  onKeySelect(): void {
    this.selectedKeyValue = this.submasterForm?.get('key')?.value;
    this.selectedKey = this.allkeys?.find(obj => obj?.Key == this.selectedKeyValue) as Keys;
    this.fetchAllSubMasters();
  }

  onClickSubmaster(event: any): void {
  
    if (event.type === 'click') {
      this.selectedSubmaserId = event.row.ID;
      console.log(this.selectedSubmaserId);
      this.fetchSubmasterById();
    }
  }

  fetchSubmasterById(): void {
    this.submasterService
      .getDetails(EndpointConstant.FILLSUBMASTERBYID + this.selectedSubmaserId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentSubmaster = response?.data[0];
          this.submasterForm.patchValue({
            key: this.currentSubmaster.Key,
            value: this.currentSubmaster.Value,
            description: this.currentSubmaster.Description,
            code: this.currentSubmaster.Code
          });
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },

      });
  }

  fetchAllSubMasters(): void {
    this.submasterService.getDetails(EndpointConstant.FILLSUBMASTER + this.selectedKeyValue)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.fillsubmasters = response?.data;
          this.selectedSubmaserId = this.fillsubmasters[0].ID;
          this.firstsubmaster = this.fillsubmasters[0].ID;
          this.fetchSubmasterById();
        },
        error: (error) => {      
          console.error('An Error Occured', error);
        },
      }
      )
  }

  fetchAllKeys(): void {
    this.submasterService
      .getDetails(EndpointConstant.FILLALLKEYS)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.allkeys = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
          this.isLoading = false;
        },
      });
  }

  onClickNewSubMaster() {
    if(!this.isCreate){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.selectedSubmaserId = 0;
    this.submasterForm.reset();
    this.submasterForm.get('key')?.setValue(this.selectedKeyValue);
    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedSubmaserId = this.firstsubmaster;
    }
    else {     
      this.enableFormControls();
    }
    return true;
  }

  onClickEditSubMaster() {
    if(!this.isEdit){
      alert('Permission Denied!');
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

  enableFormControls() {
    //this.submasterForm.get('key')?.enable();
    this.submasterForm.get('value')?.enable();
    this.submasterForm.get('description')?.enable();
    this.submasterForm.get('code')?.enable();

  }
  disbaleFormControls() {
    //this.submasterForm.get('key')?.disable();
    this.submasterForm.get('value')?.disable();
    this.submasterForm.get('description')?.disable();
    this.submasterForm.get('code')?.disable();
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

  onClickSaveSubmaster() {
    if (this.submasterForm.invalid) {
      for (const field of Object.keys(this.submasterForm.controls)) {
        const control: any = this.submasterForm.get(field);
        if (control.invalid) {
          alert('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    if(!this.isUpdate)
      this.selectedSubmaserId=0;
    const payload = {
      id: this.selectedSubmaserId,
      key: {
        value: this.selectedKeyValue
      },
      code: this.submasterForm.value.code,
      value: this.submasterForm.value.value,
      description: this.submasterForm.value.description
    };
    
    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
  }

  updateCallback(payload: any) {
    this.submasterService.updateDetails(EndpointConstant.UPDATESUBMASTER + this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          //alert('Successfully Updated Submaster');
          this.baseService.showCustomDialogue(response.data.msg);
          this.selectedSubmaserId = this.firstsubmaster;
          this.fetchSubmasterById();
          this.fetchAllSubMasters();
          this.setInitialState();
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
          alert('Please try again');
        },
      });
  }

  createCallback(payload: any) {
    this.submasterService.saveDetails(EndpointConstant.SAVESUBMASTER + this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          //alert('Successfully saved Submaster');
          this.baseService.showCustomDialogue(response.data.msg);
          this.selectedSubmaserId = this.firstsubmaster;
          this.fetchSubmasterById();
          this.fetchAllSubMasters();
          this.setInitialState();

        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Submasters', error);
        },
      });
  }

  onClickDeleteSubmaster() {
    if(!this.isDelete){
      alert('Permission Denied!');
      return false;
    }
    if (confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
    
      this.submasterService.deleteDetails(EndpointConstant.DELETESUBMASTER + this.selectedSubmaserId +'&PageId=' + this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            //alert(response.data);
            this.baseService.showCustomDialogue(response.data.msg);
            this.selectedSubmaserId = this.firstsubmaster;
            this.fetchAllSubMasters();
            this.setInitialState();
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            alert('Please try again');
          },
        });
    }
    return true;
  }
}
