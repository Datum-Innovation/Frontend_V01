import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { CategoryTypeService } from '../../services/categorytype.service';
import { CATEGORYTYPE, CATEGORYTYPES } from '../model/mastercategorytype.interface';
declare var $: any;
@Component({
  selector: 'dfinance-frontend-masters-categorytype',
  templateUrl: './masters-categorytype.component.html',
  styleUrls: ['./masters-categorytype.component.css'],
})
export class MastersCategorytypeComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  categoryTypeForm!: FormGroup;    
  allCategoryType = [] as Array<CATEGORYTYPES>;   
  selectedCategoryTypeId = 0;
  firstCategoryType = 0;
  isActive: number = 0;
  currentCategoryType = {} as CATEGORYTYPE;   
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
    private categoryTypeService: CategoryTypeService,
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
    this.categoryTypeForm = this.formBuilder.group({      
      code: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      description: [{value: '', disabled: this.isInputDisabled}, Validators.required]
    });
    this.fetchallCategoryType();

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

  fetchallCategoryType(): void {
    this.categoryTypeService
    .getDetails(EndpointConstant.FILLALLCATEGORYTYPES)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allCategoryType = response?.data;        
        this.selectedCategoryTypeId = this.allCategoryType[0].id;
        this.firstCategoryType = this.allCategoryType[0].id;
        this.fetchCategoryTypeById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickCategoryType(event:any): void {
    if (event.type === 'click') {
      this.selectedCategoryTypeId = event.row.id;
      this.fetchCategoryTypeById();
    }
  }

  fetchCategoryTypeById(): void { 
    this.categoryTypeService
    .getDetails(EndpointConstant.FILLCATEGORYTYPEBYID+this.selectedCategoryTypeId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentCategoryType = response?.data[0];
        this.categoryTypeForm.patchValue({
          code: this.currentCategoryType.code,
          description: this.currentCategoryType.description
        });
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewCategoryType(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.categoryTypeForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCategoryTypeId = this.firstCategoryType;
      this.fetchCategoryTypeById();
    } else{
      this.selectedCategoryTypeId = 0;
      this.enableFormControls(); 
      this.generateCode();    
    }
    return true;
  }

  generateCode(){
    this.categoryTypeService
    .getDetails(EndpointConstant.FETCHCATEGORYTYPECODE)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.categoryTypeForm.patchValue({
          code: response?.data,
        });
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickEditCategoryType(){
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
      this.categoryTypeForm.get('code')?.disable();
    } else{
      this.disbaleFormControls();
    }
    this.fetchCategoryTypeById();
    return true;
  }

  onClickDeleteCategoryType(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.categoryTypeService.deleteDetails(EndpointConstant.DELETECATEGORYTYPE+this.selectedCategoryTypeId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedCategoryTypeId = this.firstCategoryType;
          this.fetchallCategoryType();
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

  onClickSaveCategoryType() {
    if (this.categoryTypeForm.invalid) {
      for (const field of Object.keys(this.categoryTypeForm.controls)) {
        const control: any = this.categoryTypeForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }

    const payload = {
      "code": `${this.categoryTypeForm.get('code')?.value}`,
      "description": this.categoryTypeForm.get('description')?.value,
      "avgStockQuantity": 0,
    };
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.categoryTypeService.updateDetails(EndpointConstant.UPDATECATEGORYTYPE+this.selectedCategoryTypeId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedCategoryTypeId = this.firstCategoryType;
          this.fetchCategoryTypeById();
          this.fetchallCategoryType();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.categoryTypeService.saveDetails(EndpointConstant.SAVECATEGORYTYPE,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedCategoryTypeId = this.firstCategoryType;
          this.fetchCategoryTypeById();
          this.fetchallCategoryType();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Category Type', error);
        },
      });
  }

  enableFormControls(){
    this.categoryTypeForm.get('code')?.enable();
    this.categoryTypeForm.get('description')?.enable();
  }

  disbaleFormControls(){
    this.categoryTypeForm.get('code')?.disable();
    this.categoryTypeForm.get('description')?.disable();
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
